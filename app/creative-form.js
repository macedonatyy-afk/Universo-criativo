'use client';

import { useRef, useState } from 'react';
import { desafio } from '../desafio';

const exemplos = [
  { nome: 'SMS do banco', mensagem: 'BANCO EXEMPLO: detectamos uma compra suspeita. Sua conta será bloqueada em 10 minutos. Envie sua senha e o código recebido por SMS para cancelar a compra.' },
  { nome: 'Prêmio', mensagem: 'PARABÉNS! Você ganhou R$ 5.000 em um sorteio exclusivo. Para liberar seu prêmio, faça um Pix de R$ 29,90 como taxa de cadastro. A oferta termina hoje!' },
  { nome: 'Entrega dos Correios', mensagem: 'ENTREGA EXEMPLO: sua encomenda está retida. Pague uma taxa de R$ 4,80 pelo link desta mensagem em até 24 horas ou o pacote será devolvido. Informe também os dados do seu cartão.' },
];

export default function CreativeForm() {
  const mensagemRef = useRef(null);
  const [campos, setCampos] = useState({});
  const [resposta, setResposta] = useState('');
  const [erro, setErro] = useState('');
  const [avisoHistorico, setAvisoHistorico] = useState('');
  const [analisando, setAnalisando] = useState(false);

  function preencherExemplo(mensagem) {
    if (analisando) return;
    setCampos(previous => ({ ...previous, mensagem }));
    setResposta('');
    setErro('');
    setAvisoHistorico('');
    mensagemRef.current?.setCustomValidity('');
    mensagemRef.current?.focus();
  }

  async function analisar(evento) {
    evento.preventDefault();
    if (analisando) return;
    setAnalisando(true);
    setErro('');
    setAvisoHistorico('');
    setResposta('');
    try {
      const response = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campos }),
      });
      const text = await response.text();
      if (!response.ok) {
        setErro(text || 'Não foi possível concluir a análise. Tente novamente.');
        return;
      }
      setResposta(text);
      if (response.headers.get('X-History-Saved') === 'false') {
        setAvisoHistorico('A análise foi concluída, mas não foi possível salvar no histórico. Copie a resposta para não perdê-la.');
      }
    } catch {
      setErro('Não foi possível enviar a mensagem. Verifique sua conexão e tente novamente.');
    } finally {
      setAnalisando(false);
    }
  }

  return (
    <main className="pagina">
      <section className="cartao">
        <p className="selo-halloween">Travessuras, sim. Golpes, não.</p>
        <h1>{desafio.nome}</h1>
        <p className="descricao">{desafio.subtitulo}</p>
        {desafio.modoTeste && <p className="ajuda">Modo de teste: a resposta é um exemplo. Nenhuma mensagem será enviada à IA.</p>}
        <form onSubmit={analisar}>
          {desafio.campos.map(campo => (
            <div key={campo.id}>
              <label htmlFor={campo.id}>{campo.rotulo}</label>
              <textarea
                id={campo.id}
                name={campo.id}
                ref={campo.id === 'mensagem' ? mensagemRef : null}
                value={campos[campo.id] || ''}
                onChange={evento => setCampos(previous => ({ ...previous, [campo.id]: evento.target.value }))}
                rows={campo.linhas}
                maxLength={10000}
                required
                disabled={analisando}
                onInvalid={evento => evento.target.setCustomValidity('Preencha este campo antes de analisar.')}
                onInput={evento => evento.target.setCustomValidity('')}
              />
            </div>
          ))}
          <p className="ajuda exemplos-legenda">Teste com uma mensagem inventada:</p>
          <div className="exemplos" role="group" aria-label="Exemplos de mensagens inventadas">
            {exemplos.map(exemplo => (
              <button
                key={exemplo.nome}
                type="button"
                className="secundario exemplo-botao"
                disabled={analisando}
                onClick={() => preencherExemplo(exemplo.mensagem)}
              >
                {exemplo.nome}
              </button>
            ))}
          </div>
          <button type="submit" disabled={analisando}>{analisando ? 'Analisando...' : desafio.botao}</button>
          <p className="ajuda">{desafio.aviso}</p>
        </form>
        {erro && <p className="erro" role="alert">{erro}</p>}
        {avisoHistorico && <p className="erro" role="alert">{avisoHistorico}</p>}
        <div className="resultado" aria-live="polite">
          <h2>Resposta</h2>
          <div className="conteudo-resposta">{resposta}</div>
        </div>
      </section>
    </main>
  );
}
