import React, { useState, useRef, useEffect } from 'react';
import './Signer.css';

const ab2b64 = (buf) => {
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

const arrayBufferToHex = (buffer) => {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
};

const pemEncode = (label, arrayBuffer) => {
  const b64 = ab2b64(arrayBuffer);
  const lines = b64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
};

const pemToArrayBuffer = (pem) => {
  const b64 = pem.replace(/-----.*-----/g, '').replace(/\s+/g, '');
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

export default function Signer({ usuario }) {
  const [status, setStatus] = useState('');
  const [publicPem, setPublicPem] = useState('');
  const [privatePem, setPrivatePem] = useState('');
  const [cryptoKeyPair, setCryptoKeyPair] = useState(null);
  const [preEntregaId, setPreEntregaId] = useState('');
  const [preUserId, setPreUserId] = useState('');
  const [preNonce, setPreNonce] = useState('');
  const [entregaIdInput, setEntregaIdInput] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
  const [nonceDisplay, setNonceDisplay] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const query = new URLSearchParams(window.location.search);
    const e = query.get('entregaId');
    const u = query.get('userId');
    const n = query.get('nonce');
    if (e) {
      setPreEntregaId(e);
      setEntregaIdInput(e);
    }
    if (u) {
      setPreUserId(u);
      setUserIdInput(u);
    }
    if (n) {
      setPreNonce(n);
      setNonceDisplay(n);
    }
  }, []);

  const generateKeys = async () => {
    setStatus('Generando par de claves...');
    try {
      const kp = await window.crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );

      const spki = await window.crypto.subtle.exportKey('spki', kp.publicKey);
      const pubPem = pemEncode('PUBLIC KEY', spki);
      setPublicPem(pubPem);

      const pkcs8 = await window.crypto.subtle.exportKey('pkcs8', kp.privateKey);
      const privPem = pemEncode('PRIVATE KEY', pkcs8);
      setPrivatePem(privPem);

      setCryptoKeyPair(kp);
      setStatus('Claves generadas. Descargue la privada y suba la pública al servidor.');
    } catch (err) {
      console.error(err);
      setStatus('Error al generar claves: ' + err.message);
    }
  };

  const downloadPrivate = () => {
    if (!privatePem) return setStatus('No hay clave privada para descargar');
    const blob = new Blob([privatePem], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `private_${usuario?.username || 'user'}.pem`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadPublicKey = async () => {
    if (!publicPem) return setStatus('No hay clave pública para subir');
    setStatus('Subiendo clave pública al servidor...');
    try {
      const res = await fetch(`/api/entrega-equipo/user/${usuario.id}/public-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKeyPem: publicPem })
      });
      const json = await res.json();
      if (json.success) setStatus('Clave pública guardada en servidor');
      else setStatus('Error al guardar clave pública: ' + (json.message || ''));
    } catch (err) {
      console.error(err);
      setStatus('Error al subir clave pública');
    }
  };

  const computePdfHash = async (file) => {
    const ab = await file.arrayBuffer();
    const digest = await window.crypto.subtle.digest('SHA-256', ab);
    return arrayBufferToHex(digest);
  };

  const getDeviceFingerprint = async () => {
    const data = navigator.userAgent + '|' + navigator.language + '|' + screen.width + 'x' + screen.height;
    const hash = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
    return arrayBufferToHex(hash);
  };

  const requestChallenge = async (entregaId, userId) => {
    const res = await fetch(`/api/entrega-equipo/${encodeURIComponent(entregaId)}/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId: parseInt(userId) })
    });
    return res.json();
  };

  const signPdf = async () => {
    try {
      setStatus('Preparando firma...');
      const file = fileRef.current?.files?.[0];
      if (!file) return setStatus('Seleccione un PDF para firmar');

      const documentHash = await computePdfHash(file);

      const entregaId = entregaIdInput || preEntregaId;
      const userId = userIdInput || preUserId || usuario.id;
      if (!entregaId) return setStatus('ID de entrega requerido (complete el campo)');

      let nonce = preNonce || nonceDisplay;
      if (!nonce) {
        setStatus('Solicitando nonce al servidor...');
        const challengeJson = await requestChallenge(entregaId, userId);
        if (!challengeJson.success) return setStatus('Error al solicitar nonce: ' + (challengeJson.message || ''));
        nonce = challengeJson.nonce;
        setNonceDisplay(nonce);
      }

      const payload = { entregaId: parseInt(entregaId), userId: parseInt(userId), documentHash, nonce };
      const canonical = JSON.stringify(payload);

      setStatus('Firmando con clave privada...');
      let privateKey = cryptoKeyPair?.privateKey;
      if (!privateKey && privatePem) {
        const pkBuf = pemToArrayBuffer(privatePem);
        privateKey = await window.crypto.subtle.importKey('pkcs8', pkBuf, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
      }
      if (!privateKey) return setStatus('No hay clave privada disponible en esta sesión.');

      const dataHash = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
      const signature = await window.crypto.subtle.sign({ name: 'ECDSA', hash: { name: 'SHA-256' } }, privateKey, dataHash);
      const signatureBase64 = ab2b64(signature);

      const deviceFingerprint = await getDeviceFingerprint();

      setStatus('Enviando firma al servidor...');
      const resp = await fetch(`/api/entrega-equipo/${entregaId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: parseInt(userId), signature: signatureBase64, messageHash: documentHash, nonce, deviceFingerprint })
      });
      const rr = await resp.json();
      if (rr.success && rr.verified) setStatus('Documento firmado y verificado correctamente');
      else if (rr.success && !rr.verified) setStatus('Firma registrada pero no verificada');
      else setStatus('Error al enviar firma: ' + (rr.message || ''));
    } catch (err) {
      console.error(err);
      setStatus('Error en proceso de firmado: ' + (err.message || err));
    }
  };

  const manualRequestNonce = async () => {
    const entregaId = entregaIdInput || preEntregaId;
    const userId = userIdInput || preUserId || usuario.id;
    if (!entregaId) return setStatus('Ingrese entregaId antes de solicitar nonce');
    setStatus('Solicitando nonce...');
    try {
      const json = await requestChallenge(entregaId, userId);
      if (json.success) {
        setNonceDisplay(json.nonce);
        setStatus('Nonce recibido');
      } else setStatus('Error al solicitar nonce: ' + (json.message || ''));
    } catch (err) {
      console.error(err);
      setStatus('Error al solicitar nonce');
    }
  };

  return (
    <div className="signer-container">
      <h3>Firmador Digital (demo)</h3>

      <div className="signer-row">
        <label>Usuario</label>
        <div>{usuario?.nombre_completo || usuario?.username}</div>
      </div>

      <div className="signer-row">
        <label>Entrega ID</label>
        <input value={entregaIdInput} onChange={e => setEntregaIdInput(e.target.value)} placeholder="ID de entrega" />
      </div>

      <div className="signer-row">
        <label>User ID</label>
        <input value={userIdInput} onChange={e => setUserIdInput(e.target.value)} placeholder="User ID (opcional)" />
      </div>

      <div className="signer-row">
        <label>Nonce</label>
        <input value={nonceDisplay} readOnly placeholder="nonce (puede venir en link)" />
        <button className="btn" onClick={manualRequestNonce}>Pedir nonce</button>
      </div>

      <div className="signer-row">
        <label>Generar claves</label>
        <button className="btn" onClick={generateKeys}>Generar par ECDSA P-256</button>
        <button className="btn" onClick={downloadPrivate} disabled={!privatePem}>Descargar privada</button>
        <button className="btn" onClick={uploadPublicKey} disabled={!publicPem}>Subir pública</button>
      </div>

      <div className="signer-row">
        <label>Clave pública</label>
        <textarea className="signer-textarea" value={publicPem} readOnly />
      </div>

      <div className="signer-row">
        <label>PDF a firmar</label>
        <input type="file" ref={fileRef} accept="application/pdf" />
      </div>

      <div className="signer-actions">
        <button className="btn btn-primary" onClick={signPdf}>Firmar PDF</button>
      </div>

      <div className="status">{status}</div>
    </div>
  );
}
