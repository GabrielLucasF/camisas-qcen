'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, MessageCircle, AlertCircle, Shirt } from 'lucide-react';

const SIZES = [
  { label: 'P (52 cm larg x 71 cm comp)', value: 'P' },
  { label: 'M (55 cm larg x 73 cm comp)', value: 'M' },
  { label: 'G (58 cm larg x 75 cm comp)', value: 'G' },
  { label: 'GG (61 cm larg x 77 cm comp)', value: 'GG' },
  { label: 'G1 (64 cm larg x 80 cm comp)', value: 'G1' },
  { label: 'PP', value: 'PP' },
  { label: 'XXG', value: 'XXG' },
  { label: 'Infantil', value: 'Infantil' },
  { label: 'A definir (Vou confirmar a medida com a liderança)', value: 'A definir' },
];

export default function FormularioPreviewPage() {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantidade, setQuantidade] = useState('1');
  const [multiplosTamanhos, setMultiplosTamanhos] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('total');
  const [observacoes, setObservacoes] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !whatsapp.trim()) {
      alert('Por favor, preencha Nome e WhatsApp.');
      return;
    }
    setEnviado(true);
  };

  const whatsappAmandaUrl = `https://api.whatsapp.com/send?phone=5533998669831&text=${encodeURIComponent(
    `Olá Amanda! Fiz meu pedido da camisa do QCEN:\n\n• Nome: ${nome || 'Meu Nome'}\n• Tamanho: ${selectedSize}\n• Quantidade: ${quantidade}\n\nEstou enviando o comprovante do pagamento!`
  )}`;

  return (
    <div className="min-h-screen bg-[#090a10] text-neutral-100 p-3.5 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-4">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition px-3 py-1.5 rounded-xl bg-[#121524] border border-[#1e233d]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para o Painel</span>
          </Link>

          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
            Prévia do Formulário
          </span>
        </div>

        {/* Card Cabeçalho */}
        <div className="bg-[#101322] border-t-8 border-t-blue-600 border border-[#1e233d] rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center p-1 shrink-0">
              <Image
                src="/qcen-logo.png"
                alt="QCEN"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                Que Comece Em Nós
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 font-display uppercase">
                QCEN | Pedido Oficial de Camisas
              </h1>
            </div>
          </div>

          <div className="text-sm text-neutral-300 space-y-3 pt-3 border-t border-[#1e233d]">
            <p>
              🔥 Seja bem-vindo(a) ao pedido oficial da camisa do movimento <b>QCEN (Que Comece Em Nós)</b>! Preencha as informações abaixo para garantir a confecção da sua peça.
            </p>

            {/* Box Valores */}
            <div className="p-3.5 rounded-xl bg-[#15192c] border border-blue-500/30 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-neutral-200">
                <span>👕 <b>Valor total da camisa:</b></span>
                <span className="text-blue-400 font-mono font-bold text-sm">R$ 70,00</span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>💳 <b>Sinal mínimo para confecção (Metade):</b></span>
                <span className="text-amber-400 font-mono font-bold">R$ 35,00</span>
              </div>
              <p className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-700/50">
                Você pode pagar o valor total agora ou pagar metade (R$ 35,00) e a outra metade na entrega da camisa.
              </p>
            </div>

            {/* Box Envio de Comprovante */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-neutral-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>OBRIGATÓRIO: Envio do Comprovante PIX</span>
              </div>
              <p className="text-neutral-300">
                Assim que fizer o pagamento (metade ou total), envie o comprovante no WhatsApp para confirmação do seu pedido:
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-[#0a0d18] rounded-lg border border-emerald-500/20">
                <span className="font-bold text-white">
                  Amanda Pardim: <span className="text-emerald-400 font-mono">+55 33 99866-9831</span>
                </span>
                <a
                  href="https://api.whatsapp.com/send?phone=5533998669831&text=Ol%C3%A1%20Amanda!%20Fiz%20meu%20pedido%20da%20camisa%20do%20QCEN%20e%20estou%20enviando%20o%20comprovante."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chamar no WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Tabela Oficial de Medidas */}
            <div className="p-3.5 rounded-xl bg-[#15192c] border border-[#222846] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 text-blue-400" />
                  Guia Oficial de Medidas
                </span>
                <span className="text-[10px] text-amber-400/90 font-medium font-mono">
                  Variação ± 2cm
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#222846] text-neutral-400 uppercase text-[10px]">
                      <th className="py-1.5 px-2">Tamanho</th>
                      <th className="py-1.5 px-2">Largura</th>
                      <th className="py-1.5 px-2">Comprimento</th>
                      <th className="py-1.5 px-2">Mangas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e233d]/60 font-mono text-neutral-200">
                    <tr className="hover:bg-blue-500/5">
                      <td className="py-1.5 px-2 font-bold text-blue-400">P</td>
                      <td className="py-1.5 px-2">52 cm</td>
                      <td className="py-1.5 px-2">71 cm</td>
                      <td className="py-1.5 px-2">24 cm</td>
                    </tr>
                    <tr className="hover:bg-blue-500/5">
                      <td className="py-1.5 px-2 font-bold text-blue-400">M</td>
                      <td className="py-1.5 px-2">55 cm</td>
                      <td className="py-1.5 px-2">73 cm</td>
                      <td className="py-1.5 px-2">25 cm</td>
                    </tr>
                    <tr className="hover:bg-blue-500/5">
                      <td className="py-1.5 px-2 font-bold text-blue-400">G</td>
                      <td className="py-1.5 px-2">58 cm</td>
                      <td className="py-1.5 px-2">75 cm</td>
                      <td className="py-1.5 px-2">26 cm</td>
                    </tr>
                    <tr className="hover:bg-blue-500/5">
                      <td className="py-1.5 px-2 font-bold text-blue-400">GG</td>
                      <td className="py-1.5 px-2">61 cm</td>
                      <td className="py-1.5 px-2">77 cm</td>
                      <td className="py-1.5 px-2">27 cm</td>
                    </tr>
                    <tr className="hover:bg-blue-500/5">
                      <td className="py-1.5 px-2 font-bold text-blue-400">G1</td>
                      <td className="py-1.5 px-2">64 cm</td>
                      <td className="py-1.5 px-2">80 cm</td>
                      <td className="py-1.5 px-2">28 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-neutral-400 italic pt-1">
                * Caso tenha dúvida, selecione &quot;A definir&quot; para experimentar uma amostra com a equipe.
              </p>
            </div>

            <p className="text-[11px] text-rose-400 font-semibold">
              * Indica pergunta obrigatória
            </p>
          </div>
        </div>

        {/* Confirmação de Sucesso ao Enviar */}
        {enviado && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-3 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-lg font-bold text-white font-display uppercase">
              Glória a Deus! Pedido Registrado com Sucesso!
            </h2>
            <p className="text-sm text-neutral-300">
              Lembre-se de enviar o comprovante do pagamento para Amanda Pardim no WhatsApp:
            </p>
            <a
              href={whatsappAmandaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar Comprovante para Amanda no WhatsApp</span>
            </a>
          </div>
        )}

        {/* Formulário Interativo */}
        {!enviado && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Nome */}
            <div className="bg-[#101322] border border-[#1e233d] rounded-2xl p-5 shadow-lg space-y-2">
              <label className="block text-sm font-bold text-white">
                1. Nome Completo <span className="text-rose-400">*</span>
              </label>
              <p className="text-xs text-neutral-400">
                Informe seu nome e sobrenome para localizarmos seu pedido.
              </p>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo..."
                className="w-full bg-[#15192c] border border-[#222846] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 2. WhatsApp */}
            <div className="bg-[#101322] border border-[#1e233d] rounded-2xl p-5 shadow-lg space-y-2">
              <label className="block text-sm font-bold text-white">
                2. Seu WhatsApp com DDD <span className="text-rose-400">*</span>
              </label>
              <p className="text-xs text-neutral-400">
                Necessário para confirmação, cobrança e entrega da camisa.
              </p>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: (33) 99999-9999"
                className="w-full bg-[#15192c] border border-[#222846] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* 3. Tamanho */}
            <div className="bg-[#101322] border border-[#1e233d] rounded-2xl p-5 shadow-lg space-y-3">
              <div>
                <label className="block text-sm font-bold text-white">
                  3. Qual o tamanho da camisa? <span className="text-rose-400">*</span>
                </label>
                <p className="text-xs text-neutral-400">
                  Consulte a tabela de medidas no cabeçalho acima.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                {SIZES.map((sz) => {
                  const isChecked = selectedSize === sz.value;
                  return (
                    <label
                      key={sz.value}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition cursor-pointer select-none ${
                        isChecked
                          ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                          : 'bg-[#15192c]/80 border-[#222846] text-neutral-300 hover:border-blue-500/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tamanho"
                        value={sz.value}
                        checked={isChecked}
                        onChange={() => setSelectedSize(sz.value)}
                        className="text-blue-500"
                      />
                      <span>{sz.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Quantidade */}
            <div className="bg-[#101322] border border-[#1e233d] rounded-2xl p-5 shadow-lg space-y-2">
              <label className="block text-sm font-bold text-white">
                4. Quantidade de Camisas <span className="text-rose-400">*</span>
              </label>
              <select
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="w-full bg-[#15192c] border border-[#222846] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="1">1 camisa (R$ 70,00)</option>
                <option value="2">2 camisas (R$ 140,00)</option>
                <option value="3">3 camisas (R$ 210,00)</option>
                <option value="4">4 camisas (R$ 280,00)</option>
                <option value="5+">5 ou mais camisas</option>
              </select>
            </div>

            {/* 5. Múltiplos Tamanhos */}
            <div className="bg-[#101322] border border-[#1e233d] rounded-2xl p-5 shadow-lg space-y-2">
              <label className="block text-sm font-bold text-white">
                5. Se pediu mais de 1 camisa, quais são os tamanhos?
              </label>
              <p className="text-xs text-neutral-400">
                Exemplo: &quot;1 G e 1 M&quot; (Pode deixar em branco caso tenha pedido apenas 1 peça).
              </p>
              <input
                type="text"
                value={multiplosTamanhos}
                onChange={(e) => setMultiplosTamanhos(e.target.value)}
                placeholder="Ex: 1 G e 1 M"
                className="w-full bg-[#15192c] border border-[#222846] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 6. Forma de Pagamento */}
            <div className="bg-[#101322] border border-[#1e233d] rounded-2xl p-5 shadow-lg space-y-3">
              <div>
                <label className="block text-sm font-bold text-white">
                  6. Como será realizado o pagamento? <span className="text-rose-400">*</span>
                </label>
                <p className="text-xs text-neutral-400">
                  Todo pedido entra inicialmente como <b>Pendente</b> até a validação do comprovante.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#15192c]/80 border border-[#222846] cursor-pointer hover:border-emerald-500/40">
                  <input
                    type="radio"
                    name="formaPagamento"
                    value="total"
                    checked={formaPagamento === 'total'}
                    onChange={() => setFormaPagamento('total')}
                    className="text-emerald-500"
                  />
                  <span><b>Vou pagar o valor total agora (R$ 70,00)</b></span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#15192c]/80 border border-[#222846] cursor-pointer hover:border-amber-500/40">
                  <input
                    type="radio"
                    name="formaPagamento"
                    value="metade"
                    checked={formaPagamento === 'metade'}
                    onChange={() => setFormaPagamento('metade')}
                    className="text-amber-500"
                  />
                  <span><b>Vou pagar metade agora (R$ 35,00)</b> e a outra metade na entrega</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#15192c]/80 border border-[#222846] cursor-pointer hover:border-rose-500/40">
                  <input
                    type="radio"
                    name="formaPagamento"
                    value="depois"
                    checked={formaPagamento === 'depois'}
                    onChange={() => setFormaPagamento('depois')}
                    className="text-rose-500"
                  />
                  <span>Pagarei em outro momento antes do fechamento do lote</span>
                </label>
              </div>
            </div>

            {/* 7. Observações */}
            <div className="bg-[#101322] border border-[#1e233d] rounded-2xl p-5 shadow-lg space-y-2">
              <label className="block text-sm font-bold text-white">
                7. Observações / Recado (Opcional)
              </label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Algum detalhe adicional para a Amanda ou para a equipe..."
                className="w-full bg-[#15192c] border border-[#222846] rounded-xl p-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Botão Enviar */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition cursor-pointer"
              >
                Enviar Pedido
              </button>

              <span className="text-xs text-neutral-400">
                QCEN • Que Comece Em Nós
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
