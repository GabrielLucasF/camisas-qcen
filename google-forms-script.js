/**
 * =======================================================================
 * GOOGLE APPS SCRIPT: CRIADOR AUTOMÁTICO DO FORMULÁRIO QCEN
 * =======================================================================
 * 
 * COMO USAR:
 * 1. Acesse https://script.new (vai abrir o Google Apps Script na sua conta Google)
 * 2. Cole este código completo no editor
 * 3. Clique no botão "Executar" (Run) no topo
 * 4. Dê a permissão na sua conta Google (se solicitar)
 * 5. Pronto! O formulário do Google será criado no seu Google Drive com todas
 *    as perguntas, descrições, opções e medidas configuradas.
 * 6. Os links (de edição e para responder) aparecerão no log de execução.
 * =======================================================================
 */

function criarFormularioQCEN() {
  const form = FormApp.create('QCEN | Pedido Oficial de Camisas');
  
  // Configuração visual e descrição
  form.setTitle('QCEN | Pedido Oficial de Camisas')
    .setDescription(
      '🔥 BEM-VINDO(A) AO PEDIDO OFICIAL DAS CAMISAS DO QCEN (Que Comece Em Nós)!\n\n' +
      'Preencha seus dados para garantir sua peça do movimento.\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '💰 VALORES E FORMAS DE PAGAMENTO:\n' +
      '• Valor total da camisa: R$ 70,00\n' +
      '• Metade (sinal mínimo para confecção): R$ 35,00\n' +
      '*(Você pode pagar o valor integral agora ou pagar metade e o restante na entrega)*\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '📲 OBRIGATÓRIO: ENVIO DO COMPROVANTE PIX\n' +
      'Assim que realizar o pagamento, envie o comprovante diretamente no WhatsApp para:\n' +
      '👉 Amanda Pardim: (33) 99866-9831\n' +
      '*(O pedido entra como pendente até o envio do comprovante)*\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '📏 TABELA OFICIAL DE MEDIDAS (Largura x Comprimento x Manga):\n' +
      '• P:  52 cm larg | 71 cm comp | 24 cm manga\n' +
      '• M:  55 cm larg | 73 cm comp | 25 cm manga\n' +
      '• G:  58 cm larg | 75 cm comp | 26 cm manga\n' +
      '• GG: 61 cm larg | 77 cm comp | 27 cm manga\n' +
      '• G1: 64 cm larg | 80 cm comp | 28 cm manga\n' +
      '• A definir: (para quem deseja tirar dúvida com a liderança)\n' +
      '*(OBS: As medidas podem variar 2cm para mais ou para menos)*\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    );

  // 1. Nome Completo
  const itemNome = form.addTextItem();
  itemNome.setTitle('1. Nome Completo')
    .setHelpText('Informe seu nome e sobrenome para identificarmos seu pedido.')
    .setRequired(true);

  // 2. WhatsApp com DDD
  const itemWhatsapp = form.addTextItem();
  itemWhatsapp.setTitle('2. WhatsApp com DDD')
    .setHelpText('Exemplo: (33) 99999-9999 — Necessário para confirmação, cobrança e entrega.')
    .setRequired(true);

  // 3. Tamanho da Camisa
  const itemTamanho = form.addMultipleChoiceItem();
  itemTamanho.setTitle('3. Tamanho da Camisa')
    .setHelpText('Consulte a tabela de medidas no cabeçalho acima.')
    .setChoiceValues([
      'P (52 cm larg x 71 cm comp)',
      'M (55 cm larg x 73 cm comp)',
      'G (58 cm larg x 75 cm comp)',
      'GG (61 cm larg x 77 cm comp)',
      'G1 (64 cm larg x 80 cm comp)',
      'PP',
      'XXG',
      'Infantil',
      'A definir (Vou confirmar a medida depois com a liderança)'
    ])
    .setRequired(true);

  // 4. Quantidade de Camisas
  const itemQtd = form.addListItem();
  itemQtd.setTitle('4. Quantidade de Camisas')
    .setChoiceValues([
      '1 camisa (R$ 70,00)',
      '2 camisas (R$ 140,00)',
      '3 camisas (R$ 210,00)',
      '4 camisas (R$ 280,00)',
      '5 ou mais camisas'
    ])
    .setRequired(true);

  // 5. Múltiplos Tamanhos
  const itemMulti = form.addTextItem();
  itemMulti.setTitle('5. Se pediu mais de 1 camisa, quais são os tamanhos?')
    .setHelpText('Exemplo: 1 G e 1 M (Pode deixar em branco caso tenha pedido apenas 1 peça).');

  // 6. Pagamento
  const itemPagamento = form.addMultipleChoiceItem();
  itemPagamento.setTitle('6. Como será realizado o pagamento?')
    .setHelpText('Lembre-se de mandar o comprovante para Amanda no WhatsApp!')
    .setChoiceValues([
      'Vou pagar o valor total agora (R$ 70,00)',
      'Vou pagar metade agora (R$ 35,00) e a outra metade na entrega',
      'Pagarei em outro momento antes do fechamento do lote'
    ])
    .setRequired(true);

  // 7. Observações
  const itemObs = form.addParagraphTextItem();
  itemObs.setTitle('7. Observações / Recado (Opcional)')
    .setHelpText('Exemplo: Alguma instrução especial para entrega ou observação.');

  // Mensagem pós-envio
  form.setConfirmationMessage(
    'Glória a Deus! 🙌 Seu pedido foi registrado com sucesso!\n\n' +
    '⚠️ ATENÇÃO: Envie o comprovante do PIX agora mesmo para Amanda Pardim no WhatsApp:\n' +
    '📲 +55 33 99866-9831\n\n' +
    'O avivamento não começa em um palco. Começa em nós! 🔥'
  );

  Logger.log('====================================');
  Logger.log('FORMULÁRIO CRIADO COM SUCESSO!');
  Logger.log('Link para EDITAR: ' + form.getEditUrl());
  Logger.log('Link para RESPONDER: ' + form.getPublishedUrl());
  Logger.log('====================================');
}
