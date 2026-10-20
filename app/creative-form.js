'use client';

import { useState } from 'react';

export default function Home() {
  const [texto, setTexto] = useState('');
  const [resposta, setResposta] = useState('');

  function analisar(evento) {
    evento.preventDefault();
    setResposta(texto);
  }

  return (
    <main className="pagina">
      <section className="cartao">
        <h1>Meu Universo Criativo ✨</h1>
        <p className="descricao">Compartilhe uma ideia e veja sua mensagem aparecer aqui!</p>
        <form onSubmit={analisar}>
          <label htmlFor="texto">Digite sua ideia:</label>
          <textarea
            id="texto"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            placeholder="Escreva algo incrível..."
            rows={5}
          />
          <button type="submit">Analisar</button>
        </form>
        <div className="resultado" aria-live="polite">
          <h2>Resposta</h2>
          <div className="conteudo-resposta">{resposta}</div>
        </div>
      </section>
    </main>
  );
}
