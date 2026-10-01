'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { submitPublicOrder } from '../lib/ordersService';
import { ShirtSize } from '../types/order';
import { CheckCircle2, MessageCircle, AlertCircle, Shirt, Loader2, Sparkles, CalendarClock, ArrowRight } from 'lucide-react';

const SIZES: Array<{ label: string; value: ShirtSize; badge?: string }> = [
  { label: 'P (52 cm larg x 71 cm comp)', value: 'P' },
  { label: 'M (55 cm larg x 73 cm comp)', value: 'M', badge: '+ pedido' },
  { label: 'G (58 cm larg x 75 cm comp)', value: 'G' },
  { label: 'GG (61 cm larg x 77 cm comp)', value: 'GG' },
  { label: 'G1 (64 cm larg x 80 cm comp)', value: 'G1' },
  { label: 'A definir (Vou pedir dica para a liderança)', value: 'A definir' },
];

export default function PublicOrderPage() {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedSize, setSelectedSize] = useState<ShirtSize>('M');
  const [quantidade, setQuantidade] = useState('1');
  const [multiplosTamanhos, setMultiplosTamanhos] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (honeypot.trim().length > 0) {
      // Fake submission for bots
      setIsSubmitted(true);
      return;
    }

    const trimmedNome = nome.trim();
    if (trimmedNome.length < 2) {
      setErrorMessage('Por favor, informe seu nome completo (mínimo 2 letras).');
      return;
    }

    if (trimmedNome.length > 100) {
      setErrorMessage('Nome muito extenso. Máximo de 100 caracteres.');
      return;
    }

    const cleanedPhone = whatsapp.replace(/\D/g, '');
    if (cleanedPhone.length < 8) {
      setErrorMessage('Por favor, informe um número de WhatsApp válido com DDD.');
      return;
    }

    setIsSubmitting(true);

    const qty = Math.min(20, Math.max(1, parseInt(quantidade, 10) || 1));
    const finalNotes = [
      multiplosTamanhos.trim() ? `Tamanhos múltiplos: ${multiplosTamanhos.trim()}` : '',
      observacoes.trim() ? `Obs: ${observacoes.trim()}` : '',
    ]
      .filter(Boolean)
      .join(' | ')
      .slice(0, 500);

    const result = await submitPublicOrder({
      personName: trimmedNome,
      whatsapp: whatsapp.trim(),
      items: [{ size: selectedSize, quantity: qty }],
      notes: finalNotes || undefined,
      honeypot: honeypot || undefined,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Erro ao enviar pedido. Tente novamente.');
      return;
    }

    setIsSubmitted(true);
  };

  const whatsappAmandaUrl = `https://api.whatsapp.com/send?phone=5533998669831&text=${encodeURIComponent(
    `Olá Amanda! Acabei de fazer meu pedido da camisa do QCEN:\n\n• Nome: ${nome}\n• Tamanho: ${selectedSize}\n• Quantidade: ${quantidade}\n\nEstou enviando o comprovante do PIX!`
  )}`;

  return (
    <div className="min-h-screen bg-[#07080d] text-neutral-100 selection:bg-blue-600 selection:text-white flex flex-col items-center">
      {/* Top Navbar */}
      <header className="sticky top-0 inset-x-0 z-40 backdrop-blur-md bg-[#07080d]/80 border-b border-white/10 w-full">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
              <Image
                src="/qcen-logo.png"
                alt="QCEN"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-display text-2xl tracking-wider text-white">
              QCEN
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            Lote Oficial 2026
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-2xl px-4 py-8 sm:py-12 space-y-6">

        {/* Hero Banner Section */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Que Comece Em Nós</span>
          </div>

          <h1 className="font-display uppercase text-4xl sm:text-5xl md:text-6xl leading-[0.95] tracking-tight text-white">
            Pedido Oficial <br />
            <span className="text-gradient-electric">das Camisas do QCEN.</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-xl">
            O avivamento não começa em um palco. Começa em nós. Preencha seus dados abaixo para garantir a sua peça do movimento.
          </p>
        </section>

        {/* Card Prazo Máximo */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3.5 text-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-amber-300 block uppercase tracking-wider text-xs">
              ⏰ Prazo Máximo: Até 10/10/2026!
            </span>
            <p className="text-neutral-300 text-xs leading-relaxed mt-0.5">
              Os pedidos e envio de comprovantes encerram no <b>dia 10/10/2026</b> para fechamento do lote com a confecção.
            </p>
          </div>
        </div>

        {/* Card Valores e Regras */}
        <div className="p-5 rounded-2xl bg-[#0e111d]/90 border border-white/10 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
            Valores e Pagamento
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3.5 rounded-xl bg-[#141829] border border-blue-500/20 flex items-center justify-between gap-3">
              <span className="text-neutral-300 font-medium">👕 Valor da peça:</span>
              <span className="text-blue-400 font-mono font-bold text-base whitespace-nowrap shrink-0">
                R$ 70,00
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141829] border border-amber-500/20 flex items-center justify-between gap-3">
              <span className="text-neutral-300 font-medium">💳 Sinal mínimo (metade):</span>
              <span className="text-amber-400 font-mono font-bold text-base whitespace-nowrap shrink-0">
                R$ 35,00
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed pt-1">
            Você pode pagar o valor integral (R$ 70,00) agora ou pagar a metade (R$ 35,00) e o restante no dia da entrega.
          </p>
        </div>

        {/* Card Envio de Comprovante PIX */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
            <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>OBRIGATÓRIO: Envio do Comprovante PIX</span>
          </div>

          <p className="text-neutral-300 leading-relaxed text-xs">
            Assim que fizer o pagamento (metade ou total), envie o comprovante diretamente no WhatsApp para confirmação do seu pedido:
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#0a0d18] rounded-xl border border-emerald-500/20">
            <div>
              <span className="text-xs text-neutral-400 block font-medium">Responsável financeira:</span>
              <span className="font-bold text-white text-sm">
                Amanda Pardim: <span className="text-emerald-400 font-mono">+55 33 99866-9831</span>
              </span>
            </div>

            <a
              href="https://api.whatsapp.com/send?phone=5533998669831&text=Ol%C3%A1%20Amanda!%20Fiz%20meu%20pedido%20da%20camisa%20do%20QCEN%20e%20estou%20enviando%20o%20comprovante."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs px-5 py-2.5 shadow-lg shadow-emerald-500/20 transition shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chamar no WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Card Guia Oficial de Medidas */}
        <div className="p-5 rounded-2xl bg-[#0e111d]/90 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-blue-400" />
              Tabela Oficial de Medidas
            </span>
            <span className="text-[11px] text-amber-400 font-medium font-mono">
              Variação ± 2cm
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400 uppercase text-[10px]">
                  <th className="py-2 px-3">Tamanho</th>
                  <th className="py-2 px-3">Largura</th>
                  <th className="py-2 px-3">Comprimento</th>
                  <th className="py-2 px-3">Mangas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-neutral-200">
                <tr className="hover:bg-blue-500/5">
                  <td className="py-2 px-3 font-bold text-blue-400">P</td>
                  <td className="py-2 px-3">52 cm</td>
                  <td className="py-2 px-3">71 cm</td>
                  <td className="py-2 px-3">24 cm</td>
                </tr>
                <tr className="hover:bg-blue-500/5">
                  <td className="py-2 px-3 font-bold text-blue-400">M</td>
                  <td className="py-2 px-3">55 cm</td>
                  <td className="py-2 px-3">73 cm</td>
                  <td className="py-2 px-3">25 cm</td>
                </tr>
                <tr className="hover:bg-blue-500/5">
                  <td className="py-2 px-3 font-bold text-blue-400">G</td>
                  <td className="py-2 px-3">58 cm</td>
                  <td className="py-2 px-3">75 cm</td>
                  <td className="py-2 px-3">26 cm</td>
                </tr>
                <tr className="hover:bg-blue-500/5">
                  <td className="py-2 px-3 font-bold text-blue-400">GG</td>
                  <td className="py-2 px-3">61 cm</td>
                  <td className="py-2 px-3">77 cm</td>
                  <td className="py-2 px-3">27 cm</td>
                </tr>
                <tr className="hover:bg-blue-500/5">
                  <td className="py-2 px-3 font-bold text-blue-400">G1</td>
                  <td className="py-2 px-3">64 cm</td>
                  <td className="py-2 px-3">80 cm</td>
                  <td className="py-2 px-3">28 cm</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-neutral-400 italic pt-1">
            * Se tiver dúvida sobre o tamanho ideal, selecione &quot;A definir&quot; para pedir dicas à liderança.
          </p>
        </div>

        {/* TELA DE SUCESSO PÓS-ENVIO */}
        {isSubmitted && (
          <div className="bg-[#0e111d] border border-emerald-500/40 rounded-3xl p-6 sm:p-10 text-center space-y-5 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                Pedido Registrado!
              </span>
              <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-white">
                Glória a Deus, {nome.split(' ')[0]}! 🙌
              </h2>
              <p className="text-sm text-neutral-300 max-w-md mx-auto">
                Seu pedido foi registrado com sucesso! Agora envie o comprovante do pagamento para a Amanda:
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141829] border border-white/10 text-xs text-neutral-300 space-y-2 text-left max-w-md mx-auto font-mono">
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-neutral-400">Nome:</span>
                <span className="text-white font-bold">{nome}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-neutral-400">Tamanho:</span>
                <span className="text-blue-400 font-bold">{selectedSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Quantidade:</span>
                <span className="text-white font-bold">{quantidade} camisa(s)</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={whatsappAmandaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm px-8 py-4 shadow-xl shadow-emerald-500/25 transition cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Enviar Comprovante para Amanda no WhatsApp</span>
              </a>
            </div>

            <p className="text-xs text-neutral-400 italic pt-2">
              &quot;O avivamento não começa em um palco. Começa em nós!&quot; 🔥
            </p>
          </div>
        )}

        {/* FORMULÁRIO DE PEDIDO */}
        {!isSubmitted && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Anti-bot honeypot field */}
            <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
              <label htmlFor="website_confirm">Website</label>
              <input
                id="website_confirm"
                type="text"
                name="website_confirm"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Nome Completo */}
            <div className="bg-[#0e111d]/90 border border-white/10 rounded-2xl p-5 shadow-lg space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                1. Nome Completo <span className="text-rose-400">*</span>
              </label>
              <p className="text-xs text-neutral-400">
                Informe seu nome e sobrenome para identificarmos seu pedido.
              </p>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full bg-[#131625] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            {/* 2. WhatsApp */}
            <div className="bg-[#0e111d]/90 border border-white/10 rounded-2xl p-5 shadow-lg space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                2. Seu WhatsApp com DDD <span className="text-rose-400">*</span>
              </label>
              <p className="text-xs text-neutral-400">
                Importante para confirmação, cobrança e aviso de entrega da camisa.
              </p>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: (33) 99999-9999"
                className="w-full bg-[#131625] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono transition"
              />
            </div>

            {/* 3. Tamanho da Camisa */}
            <div className="bg-[#0e111d]/90 border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                  3. Qual o tamanho da sua camisa? <span className="text-rose-400">*</span>
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
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer select-none ${
                        isChecked
                          ? 'bg-blue-600/20 border-blue-500 text-white font-semibold shadow-sm shadow-blue-500/20'
                          : 'bg-[#131625] border-white/10 text-neutral-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="tamanho"
                          value={sz.value}
                          checked={isChecked}
                          onChange={() => setSelectedSize(sz.value)}
                          className="text-blue-500"
                        />
                        <span className="truncate">{sz.label}</span>
                      </div>
                      {sz.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 whitespace-nowrap shrink-0 ml-2">
                          {sz.badge}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Quantidade */}
            <div className="bg-[#0e111d]/90 border border-white/10 rounded-2xl p-5 shadow-lg space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                4. Quantas camisas você deseja? <span className="text-rose-400">*</span>
              </label>
              <select
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="w-full bg-[#131625] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              >
                <option value="1">1 camisa (R$ 70,00)</option>
                <option value="2">2 camisas (R$ 140,00)</option>
                <option value="3">3 camisas (R$ 210,00)</option>
                <option value="4">4 camisas (R$ 280,00)</option>
                <option value="5+">5 ou mais camisas</option>
              </select>
            </div>

            {/* 5. Múltiplos Tamanhos */}
            <div className="bg-[#0e111d]/90 border border-white/10 rounded-2xl p-5 shadow-lg space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
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
                className="w-full bg-[#131625] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            {/* 6. Observações */}
            <div className="bg-[#0e111d]/90 border border-white/10 rounded-2xl p-5 shadow-lg space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                6. Observações / Recado (Opcional)
              </label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Alguma instrução especial ou observação para a liderança..."
                className="w-full bg-[#131625] border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            {/* Botão de Envio (Pill Button estilo Lovable QCEN) */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-4 font-bold text-sm sm:text-base uppercase tracking-wider glow-electric hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando Pedido...</span>
                  </>
                ) : (
                  <>
                    <span>Garantir Minha Camisa</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <span className="text-xs text-neutral-500 font-medium">
                QCEN • Que Comece Em Nós
              </span>
            </div>
          </form>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center border-t border-white/10 mt-8 space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <span>Que Comece Em Nós</span>
        </div>
        <p className="text-xs text-neutral-500 italic">
          &quot;O avivamento não começa em um palco. Começa em nós.&quot; 🔥
        </p>
      </footer>
    </div>
  );
}
