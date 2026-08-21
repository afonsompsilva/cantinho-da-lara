(() => {
  "use strict";

  // =========================================================
  // UTILITÁRIOS
  // =========================================================

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // =========================================================
  // STARFIELD
  // =========================================================

  const field = $("#starfield");

  for (let i = 0; i < 70; i++) {
    const s = document.createElement("i");

    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDelay = (Math.random() * 7) * -1 + "s";

    field.appendChild(s);
  }

  // =========================================================
  // ESTADO
  // =========================================================

  const KEY = "larinhaStateV5";

  const base = {
    stars: 0,
    seen: {},
    night: false,
    finalUnlocked: false
  };

  let state;

  try {
    state = {
      ...base,
      ...(JSON.parse(localStorage.getItem(KEY)) || {})
    };
  } catch {
    state = { ...base };
  }

  const save = () => {
    localStorage.setItem(KEY, JSON.stringify(state));
    updateUI();
  };

  // =========================================================
  // TOAST
  // =========================================================

  const toast = t => {
    const e = $("#toast");

    e.textContent = t;
    e.classList.add("show");

    clearTimeout(window.__toast);

    window.__toast = setTimeout(
      () => e.classList.remove("show"),
      2400
    );
  };

  // =========================================================
  // ESTRELAS / PROGRESSO
  // =========================================================

  const once = (key, n = 1, reason = "") => {
    if (state.seen[key]) return;

    state.seen[key] = 1;
    state.stars = Math.min(150, state.stars + n);

    save();

    if (reason) {
      toast(
        `+${n} estrela${n > 1 ? "s" : ""} · ${reason} ⭐`
      );
    }

    checkFinal();
  };

  function updateUI() {
    const count = $("#starCount");

    if (count) {
      count.textContent = state.stars;
    }

    const bar = $("#bar");

    if (bar) {
      bar.style.width = `${state.stars / 150 * 100}%`;
    }

    const tree = $("#gardenTree");

    if (tree) {
      tree.textContent =
        state.stars >= 150 ? "🌳" :
        state.stars >= 100 ? "🌲" :
        state.stars >= 50 ? "🌿" :
        "🌱";
    }

    const flowers = $("#gardenFlowers");

    if (flowers) {
      flowers.textContent =
        "🌷".repeat(
          Math.min(10, Math.floor(state.stars / 15))
        );
    }

    renderRewards();
    renderProgress();
  }

  function renderProgress() {
    const max = 150;
    const p = Math.min(100, state.stars / max * 100);

    const pb = $("#progressBar");

    if (pb) {
      pb.style.width = `${p}%`;
    }

    const sb = $("#storyProgress");

    if (sb) {
      sb.style.width =
        `${Math.min(
          100,
          Object.keys(state.seen)
            .filter(k => k.startsWith("chapter-")).length / 8 * 100
        )}%`;
    }
  }

  // =========================================================
  // NAVEGAÇÃO
  // =========================================================

  function go(id) {
    const target = $("#" + id);

    if (!target) return;

    $$(".screen").forEach(s =>
      s.classList.toggle("active", s === target)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    document.body.dataset.screen = id;

    if (id === "constellation") {
      requestAnimationFrame(drawConstellation);
    }

    if (id === "finale") {
      state.finalUnlocked = true;
    }

    renderProgress();
  }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-go]");

    if (b) {
      go(b.dataset.go);
    }
  });

  // =========================================================
  // MODAL
  // =========================================================

  const modal = $("#modal");

  function openModal(icon, title, html) {
    $("#modalIcon").textContent = icon;
    $("#modalTitle").textContent = title;
    $("#modalContent").innerHTML = html;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  $("#modalClose").onclick = closeModal;

  modal.addEventListener("click", e => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeModal();
    }
  });

  // =========================================================
  // OPENING
  // =========================================================

  $("#enterBtn").onclick = () => {
    $("#opening").classList.add("leave");

    setTimeout(
      () => $("#opening").remove(),
      650
    );

    once(
      "entered",
      1,
      "entraste no cantinho"
    );
  };

  // =========================================================
  // HOME NAVIGATION
  // =========================================================

  const homeNav = [
    ["safe", "🫂", "Para ti", "calma e apoio"],
    ["letters", "💌", "Cartas", "abre quando precisares"],
    ["story", "📖", "A nossa história", "os capítulos"],
    ["memories", "📸", "Memórias", "momentos nossos"],
    ["room", "🏠", "A nossa sala", "explora tudo"],
    ["secrets", "🔐", "Segredos", "há coisas escondidas"],
    ["garden", "⭐", "O jardim", "faz crescer o nosso lugar"],
    ["constellation", "🌌", "Constelação", "palavras nas estrelas"],
    ["future", "💍", "O futuro", "o que ainda quero viver"]
  ];

  $("#homeNav").innerHTML = homeNav.map(x =>
    `<button class="nav-card" data-go="${x[0]}">
      <span>${x[1]}</span>
      <b>${x[2]}</b>
      <small>${x[3]}</small>
    </button>`
  ).join("");

  // =========================================================
  // SAFE SPACE
  // =========================================================

  const safeData = {
    hug: [
      "🫂",
      "O meu abraço",
      `<p>Fecha os olhos por alguns segundos</p>
       <p>Se eu pudesse, estava aí contigo agora</p>
       <p>Sem perguntas</p>
       <p>Sem pressa</p>
       <p>Sem precisares de explicar nada</p>

       <p>Só eu e tu</p>
       <p>Num abraço apertado, daqueles que fazem o mundo ficar em silêncio por uns momentos 🤍</p>

       <p>Mas, como nem sempre posso estar aí, quero que faças uma coisa por mim</p>

       <p>Se estiveres em casa, pega num dos peluches que te dei</p>
       <p>Abraça-o com força</p>
       <p>E imagina que sou eu</p>

       <p>Imagina os meus braços à tua volta</p>
       <p>A minha presença junto a ti</p>
       <p>E aquele abraço demorado em que não precisas de dizer absolutamente nada</p>

       <p>Fica assim o tempo que precisares</p>
       <p>Respira devagar</p>
       <p>Aperta o peluche contra ti</p>

       <p>E lembra-te de que, mesmo quando não estou fisicamente aí, o meu carinho continua contigo</p>

       <p>Agora fecha os olhos</p>
       <p>Respira fundo</p>
       <p>E deixa-me abraçar-te através dele ❤️</p>

       <p><b>Não precisas de estar bem para merecer o meu abraço.</b></p>`
    ],

    words: [
      "💌",
      "O que eu te diria",
      `<p>Meu amor, aquilo que estás a sentir não te torna fraca</p>

       <p>Há momentos em que tudo parece mais pesado</p>
       <p>Em que a tua cabeça não pára</p>
       <p>E em que parece difícil encontrar um bocadinho de calma</p>

       <p>Mas lembra-te de uma coisa</p>
       <p>Um momento difícil é apenas um momento</p>
       <p>Não define quem tu és</p>
       <p>Não diminui a pessoa incrível que és</p>
       <p>E não vai definir o resto do teu dia</p>

       <p>Não precisas de resolver tudo agora</p>
       <p>Vamos devagar</p>
       <p>Um respirar de cada vez</p>
       <p>Um momento de cada vez</p>

       <p>E se hoje estiver a ser difícil, deixa-me ficar contigo nesse momento</p>
       <p>Não estás sozinha</p>

       <p><b>Eu estou contigo, meu amor. ❤️</b></p>`
    ],

    ground: [
      "🌿",
      "Volta ao agora 1",
      `<div class="grounding">
        <div><b>5</b><span>coisas que consegues ver</span></div>
        <div><b>4</b><span>coisas que consegues tocar</span></div>
        <div><b>3</b><span>sons que consegues ouvir</span></div>
        <div><b>2</b><span>cheiros que consegues sentir</span></div>
        <div><b>1</b><span>coisa boa que sabes agora</span></div>
       </div>
       <p>Não precisas de fazer tudo perfeitamente. Só repara.</p>`
    ],

    promise: [
      "🤍",
      "Uma promessa minha",
      `<p>Prometo continuar a tentar ser um lugar seguro para ti</p>

       <p>Um lugar onde possas ficar quando estiveres cansada</p>
       <p>Onde possas respirar quando tudo parecer demasiado</p>
       <p>Onde nunca sintas que tens de esconder aquilo que estás a sentir</p>

       <p>Não prometo saber sempre o que dizer</p>
       <p>Nem ter sempre a solução mais apropriada para tudo</p>

       <p>Mas prometo ouvir-te</p>
       <p>Prometo ficar</p>
       <p>Prometo tentar compreender-te, mesmo quando nem tu conseguires explicar o que estás a sentir</p>

       <p>Quero aprender contigo</p>
       <p>Aprender a cuidar melhor de ti</p>
       <p>A perceber quando precisas de palavras e quando só precisas de um abraço</p>

       <p>Porque não quero ser apenas a pessoa que está contigo nos dias bons</p>
       <p>Quero ser também aquela que segura a tua mão nos dias mais difíceis</p>

       <p><b>Enquanto me quiseres ao teu lado, vou continuar aqui, meu amor. ❤️</b></p>`
    ],

    night: [
      "🌙",
      "Podemos ficar em silêncio",
      `<p>Não precisas de conversar</p>

       <p>Não precisas de encontrar as palavras certas</p>
       <p>Nem de explicar aquilo que estás a sentir</p>

       <p>Imagina-nos os dois no sofá deitados e abraçados</p>
       <p>Com a luz desligada</p>
       <p>Bem agarradinhos</p>
       <p>Enquanto o mundo lá fora está em silêncio</p>

       <p>Tu encostada a mim</p>
       <p>E eu simplesmente ali, contigo</p>

       <p>Sem perguntas</p>
       <p>Sem pressas</p>
       <p>Sem precisarmos de preencher o silêncio</p>

       <p>Porque às vezes, estar presente é tudo o que precisamos</p>

       <p>Às vezes, companhia também é silêncio</p>

       <p>E se hoje não te apetecer falar, está tudo bem</p>
       <p>Podes simplesmente ficar aqui comigo</p>

       <p><b>Eu fico. ❤️</b></p>`
    ],

    letter: [
      "💌",
      "Uma carta rápida",
      `<p>Não precisas de resolver tudo agora</p>
       <p>Não precisas de fingir que está tudo bem</p>
       <p>Respira devagar e dá-te tempo</p>

       <p>Eu estou contigo</p>
       <p>Mesmo que não esteja aí fisicamente, quero que sintas que não estás sozinha</p>

       <p>Se estiver difícil, fica aqui um bocadinho</p>
       <p>Respira</p>
       <p>Descansa</p>
       <p>E deixa este momento passar devagar</p>

       <p><b>Não precisas de passar por este momento sozinha, meu amor. ❤️</b></p>`
    ]
  };

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-safe]");

    if (!b) return;

    const d = safeData[b.dataset.safe];

    if (d) {
      openModal(d[0], d[1], d[2]);

      once(
        `safe-${b.dataset.safe}`,
        1,
        "um bocadinho de calma"
      );
    }
  });

  // =========================================================
  // LETTERS
  // =========================================================

  const letters = [
  [
    "🌧️",
    "Quando estiveres triste",
    "Meu amor, não precisas de resolver tudo hoje",
    `<p>Se hoje só conseguires respirar e descansar, já chega</p>

     <p>Não tens de ter forças para tudo</p>
     <p>Nem tens de fingir que está tudo bem quando não está</p>

     <p>Quero que saibas que estou aqui para ti</p>
     <p>Sem pressa</p>
     <p>Sem esperar que te sintas melhor imediatamente</p>

     <p>Podes chorar se precisares</p>
     <p>Podes simplesmente descansar</p>

     <p>Não precisas de ser forte o tempo todo</p>
     <p>Podes simplesmente ser tu</p>
     <p>Com os teus dias bons e com os teus dias mais difíceis</p>

     <p>E mesmo nesses dias, nada muda na forma como te vejo</p>
     <p>Continuas a ser a minha princesinha, a pessoa que amo e de quem quero cuidar</p>

     <p>Por isso, hoje não penses em tudo o que tens de fazer</p>
     <p>Cuida apenas de ti</p>
     <p>Um bocadinho de cada vez</p>

     <p><b>E lembra-te de que eu continuo aqui, meu amor. ❤️</b></p>`
  ],

    [
      "🌬️",
      "Quando estiveres nervosa",
      "para quando a cabeça começar a correr",
      `<p>Respira comigo</p>
       <p>Devagar</p>

       <p>Eu sei que, às vezes, a tua cabeça começa a correr mais depressa do que devia</p>
       <p>Começas a pensar em tudo ao mesmo tempo</p>
       <p>Em todos os cenários possíveis</p>
       <p>E acabas por sentir que precisas de encontrar uma resposta para tudo</p>

       <p>Mas não precisas</p>

       <p>Não precisas de imaginar o que pode acontecer daqui a uma hora, amanhã ou daqui a uma semana</p>
       <p>Fica apenas neste momento</p>
       <p>Nesta respiração</p>

       <p>Inspira devagar</p>
       <p>E solta lentamente</p>

       <p>Tu és capaz</p>
       <p>Mesmo quando a tua cabeça te fizer acreditar no contrário</p>

       <p>E quando não conseguires acreditar em ti, acredita em mim</p>
       <p>Porque eu continuo a acreditar sempre em ti</p>
       <p>Continuo a confiar na pessoa incrível que és</p>

       <p><b>Vamos devagar, meu amor. Um momento de cada vez. Eu estou contigo. ❤️</b></p>`
    ],

    [
      "🫂",
      "Quando precisares de um abraço",
      "um abraço meu guardado aqui",
      `<p>Se eu pudesse, estava aí contigo agora</p>

       <p>Ia ter contigo</p>
       <p>Abraçava-te com força</p>
       <p>E ficava assim contigo o tempo que precisasses</p>

       <p>Sem precisar de dizer nada</p>
       <p>Sem tentar resolver tudo</p>

       <p>Fecha os olhos por alguns segundos</p>
       <p>Respira devagar</p>
       <p>E imagina os meus braços à tua volta</p>

       <p>Imagina que estás segura</p>
       <p>Que podes descansar por um bocadinho</p>
       <p>E que não precisas de carregar tudo sozinha</p>

       <p><b>Este abraço é meu e está guardado aqui para quando precisares dele. 🫂❤️</b></p>`
    ],

    [
      "💭",
      "Quando estiveres a pensar demasiado",
      "nem tudo precisa de uma resposta agora",
      `<p>Às vezes, a tua cabeça fica cheia de pensamentos ao mesmo tempo</p>

       <p>Pensamentos que não param</p>
       <p>Perguntas para as quais queres encontrar respostas</p>
       <p>E cenários que talvez nem cheguem a acontecer</p>

       <p>Mas não precisas de encontrar uma resposta para tudo agora</p>
       <p>Nem tudo precisa de ser resolvido neste momento</p>

       <p>Respira devagar</p>
       <p>Deixa os pensamentos passarem sem precisares de os agarrar a todos</p>
       <p>Volta ao presente</p>
       <p>A este momento</p>

       <p>E lembra-te</p>
       <p>Não precisas de carregar tudo sozinha</p>
       <p>Podes descansar</p>
       <p>Podes deixar algumas coisas para amanhã</p>

       <p><b>Agora, respira e dá um bocadinho de descanso à tua cabeça. Eu estou aqui contigo. ❤️</b></p>`
    ],

    [
      "❤️",
      "Quando precisares de amor",
      "uma coisa simples, para leres devagar",
      `<p class="modal-big">Eu amo-te. Muitooo. ❤️</p>

       <p>És a pessoa mais importante da minha vida</p>

       <p>E quero que nunca te esqueças disso, principalmente nos dias em que não te sentires bem</p>

       <p>Não precisas de fazer nada para merecer o meu amor</p>
       <p>Não precisas de estar feliz</p>
       <p>Não precisas de estar forte</p>
       <p>Não precisas de ser perfeita</p>

       <p>Quero-te exatamente como és</p>
       <p>Nos teus dias bons</p>
       <p>Nos teus dias difíceis</p>
       <p>Quando ris</p>
       <p>Quando choras</p>
       <p>E até quando a tua cabeça te diz que não és suficiente</p>

       <p>Espero que, quando leres estas palavras, consigas sentir um bocadinho do amor que tenho por ti</p>

       <p><b>Eu amo-te, meu amor. Hoje, amanhã e em todos os dias que ainda temos para viver juntos. ❤️</b></p>`
    ],

    [
      "🌙",
      "Quando não conseguires dormir",
      "para uma noite mais tranquila",
      `<p>Fecha os olhos e respira devagar</p>

       <p>Imagina que estamos juntos</p>
       <p>Sem preocupações</p>
       <p>Sem nada que tenhas de resolver agora</p>

       <p>Imagina-te deitada ao meu lado</p>
       <p>Bem agarradinha a mim</p>

       <p>Por agora, podes deixar tudo para amanhã</p>
       <p>Não precisas de pensar no que aconteceu</p>
       <p>Nem no que ainda está por acontecer</p>

       <p>Apenas respira</p>
       <p>Deixa o teu corpo relaxar</p>
       <p>E permite-te descansar</p>

       <p>Se os pensamentos voltarem, deixa-os passar</p>
       <p>Volta à tua respiração</p>
       <p>E imagina o meu braço à tua volta</p>

       <p><b>Boa noite, meu amor. Descansa e dorme tranquila. Eu estou contigo. Liga-me sempre que precisares🌙❤️</b></p>`
    ],

    [
      "✈️",
      "Quando estivermos longe",
      "para os dias de saudade",
      `<p>Tenho saudades tuas</p>

       <p>Sei que há dias em que a distância custa mais</p>
       <p>Em que só queria poder estar aí contigo</p>
       <p>Dar-te um abraço, olhar para ti e sentir que está tudo bem</p>

       <p>Mas lembra-te de uma coisa</p>
       <p>A distância pode separar-nos por alguns momentos, mas nunca muda aquilo que sinto por ti</p>

       <p>Mesmo longe, continuo aqui</p>
       <p>A pensar em ti</p>
       <p>A lembrar-me de nós</p>
       <p>E a desejar estar novamente ao teu lado</p>

       <p>Quando sentires saudades, fecha os olhos por uns segundos</p>
       <p>Imagina o meu abraço</p>
       <p>E lembra-te de todos os momentos bonitos que ainda temos para viver juntos</p>

       <p>Esta distância é apenas temporária</p>
       <p>E cada dia que passa é mais um dia que nos aproxima de estarmos juntos outra vez</p>

       <p><b>Tenho muitas saudades tuas, meu amor. E mesmo longe, continuo contigo. ❤️</b></p>`
    ],

    [
      "☀️",
      "Quando tiveres um dia bom",
      "porque também quero celebrar contigo",
      `<p>Não quero estar contigo apenas nos momentos difíceis</p>

       <p>Quero estar contigo também nos dias em que tudo corre bem</p>
       <p>Nos dias em que estás feliz</p>
       <p>Nos dias em que tens vontade de rir e contar tudo o que aconteceu</p>

       <p>Quero ouvir-te falar sobre o teu dia</p>
       <p>Quero conhecer as pequenas coisas que te fizeram sorrir</p>
       <p>E quero celebrar contigo cada uma das tuas vitórias</p>

       <p>Porque as tuas conquistas também me deixam orgulhoso</p>
       <p>E a tua felicidade também é uma felicidade minha</p>

       <p>Por isso, se hoje estás feliz</p>
       <p>Não guardes esse sorriso só para ti</p>
       <p>Vem partilhá-lo comigo</p>

       <p>Quero rir contigo</p>
       <p>Quero aproveitar contigo</p>
       <p>Quero criar mais memórias bonitas ao teu lado</p>

       <p><b>Se estás feliz hoje, eu quero estar feliz contigo. ☀️❤️</b></p>`
    ]
  ];

  $("#lettersGrid").innerHTML = letters.map((x, i) =>
    `<button class="letter-card" data-letter="${i}">
      <span>${x[0]}</span>
      <b>${x[1]}</b>
      <small>${x[2]}</small>
    </button>`
  ).join("");

  $("#lettersGrid").addEventListener("click", e => {
    const b = e.target.closest("[data-letter]");

    if (!b) return;

    const x = letters[+b.dataset.letter];

    openModal(x[0], x[1], x[3]);

    once(
      `letter-${b.dataset.letter}`,
      1,
      "carta descoberta"
    );
  });

  // =========================================================
// STORY
// =========================================================

const chapters = [
  [
    "Instagram",
    "Antes de sermos nós.",
    "Antes dos nossos abraços, dos nossos beijos, das nossas memórias e de tudo aquilo que hoje chamamos de nosso,",
    "existiam duas pessoas que começaram a falar pelo Instagram. Não sabíamos o que vinha a seguir, que aquela conversa ia ganhar um lugar tão grande nas nossas vidas.",
    "Mas foi numa simples mensagem, que começou a nossa história."
  ],

  [
    "Depois do Canadá",
    "O nosso primeiro encontro.",
    "Depois de tantas conversas, chegou finalmente o momento de estarmos frente a frente.",
    "Jardim António Borges, Mac, cocktails... Um dia simples por fora, mas que para mim ficou guardado de uma forma muito especial.",
    "Foi aí que percebi que queria viver muito mais momentos contigo."
  ],

  [
    "19 · 12 · 2025",
    "O dia antes de sermos nós.",
    "Foi neste dia que percebi, ainda mais a sério, o quanto queria construir alguma coisa contigo.",
    "Já não eras apenas alguém de quem eu gostava. Eras alguém que eu queria na minha vida.",
    "E no dia seguinte, tudo mudou. ❤️"
  ],

  [
    "20 · 12 · 2025",
    "O começo de nós.",
    "Pedi-te em namoro e, naquele momento, começou oficialmente a nossa história.",
    "A partir daí, deixou de existir apenas um eu e um tu. Passou a existir um nós.",
    "E é esse nós que continuo a escolher todos os dias. ❤️"
  ],

  [
    "Os primeiros meses",
    "Aprendemos a ter saudades.",
    "Os primeiros meses ensinaram-nos que gostar também é sentir a falta.",
    "Aprendemos a aproveitar cada minuto juntos, cada abraço, cada conversa e cada pequeno momento.",
    "E quanto mais tempo passava, mais queria ficar contigo."
  ],

  [
    "Primeira noite na tua casa",
    "Um momento simples, mas nosso.",
    "Não aconteceu nada extraordinário. Éramos apenas nós, juntos, a viver mais um momento.",
    "Mas são precisamente esses momentos simples que acabam por ficar mais tempo no coração.",
    "E esta é uma memória que vou guardar sempre comigo."
  ],

  [
    "Hoje",
    "Ainda nós.",
    "Já vivemos tanta coisa desde aquele primeiro dia.",
    "Mudámos, crescemos e aprendemos um com o outro, mas continuamos aqui, cada vez mais próximos.",
    "E ainda sinto que a nossa melhor parte está por vir."
  ],

  [
    "Próximo capítulo",
    "Ainda por escrever.",
    "Ainda não sabemos tudo o que a vida nos vai trazer.",
    "Mas há viagens, sonhos, aventuras, abraços e milhares de momentos que ainda quero viver contigo.",
    "Porque, se depender de mim, esta história ainda vai ter muitos capítulos. ❤️"
  ]
];


// Criar os capítulos na timeline
$("#storyLine").innerHTML = chapters.map((x, i) =>
  `<div class="chapter">
    <div class="chapter-dot">♡</div>

    <button data-chapter="${i}">
      <span>${x[0]}</span>
      <strong>${x[1]}</strong>
      <small>${x[2]}</small>
    </button>

  </div>`
).join("");


// Abrir capítulo completo ao clicar
$("#storyLine").addEventListener("click", e => {
  const b = e.target.closest("[data-chapter]");

  if (!b) return;

  const x = chapters[+b.dataset.chapter];

  openModal(
    "📖",
    x[1],
    `
      <p>${x[2]}</p>
      <p>${x[3]}</p>
      <p>${x[4]}</p>
    `
  );

  once(
    `chapter-${b.dataset.chapter}`,
    1,
    "capítulo descoberto"
  );
});

 // =========================================================
// MEMORIES CAROUSEL
// =========================================================

const memories = [

  [
    "As tuas florzinhas",

    "Gosto de te oferecer flores. Não porque seja preciso haver uma ocasião especial, mas porque gosto de encontrar pequenas formas de te mostrar o quanto és importante para mim.",

    "Cada flor que te dou leva um bocadinho do meu carinho e da vontade de te ver sorrir.",

    "Quero que as flores façam parte da nossa história, nos dias especiais, nos dias normais e até naqueles em que simplesmente me apetece mimar-te.",

    "Porque, no fundo, acho que nunca vou encontrar flores bonitas o suficiente para representar tudo aquilo que sinto por ti.",

    "img/momento1.jpeg"
  ],

  [
    "nós · sem pressa",

    "Gosto especialmente dos momentos em que não precisamos de fazer nada para sermos felizes.",

    "Nós agarrados, completamente descansados.",

    "São momentos assim que me fazem perceber que não preciso de grandes planos, grandes lugares ou grandes acontecimentos.",

    "Às vezes, só preciso de ti perto de mim para sentir que estou exatamente onde quero estar.",

    "img/momento2.jpeg"
  ],

  [
    "tu · e tudo o que é teu",

    "Gosto de conhecer as pequenas coisas que fazem parte da tua vida e, aos poucos, sentir que também fazem parte da nossa.",

    "Até os teus cães ganharam um bocadinho do meu coração, e confesso que gosto de ver o carinho que tens por eles.",

    "Quero estar presente não só nos momentos que vivemos juntos, mas também em tudo aquilo que é importante para ti.",

    "Porque gostar de ti também é gostar de conhecer e cuidar de tudo aquilo que te faz feliz.",

    "img/momento3.jpeg"
  ],

  [
    "tu · e as minhas brincadeiras",

    "Tu querias uma fotografia bonita e eu, como sempre, tive de estragar um bocadinho o momento com as minhas brincadeiras.",

    "Mas acho que é exatamente isso que gosto em nós. Contigo posso ser eu, posso brincar, fazer-te rir e não ter medo de parecer ridículo.",

    "Nem todas as nossas fotografias precisam de ser perfeitas. Algumas só precisam de mostrar aquilo que somos quando estamos juntos.",

    "E espero nunca perder esta vontade de te fazer rir, mesmo quando só querias uma fotografia séria.",

    "img/momento4.jpeg"
  ],

  [
    "um bocadinho de Natal",

    "Há qualquer coisa especial em viver momentos contigo durante épocas que já são bonitas por si só.",

    "As luzes, o frio, as ruas e tu ao meu lado fizeram daquele passeio uma memória que gosto de guardar.",

    "Mas acho que, no fundo, não foram as luzes de Natal que tornaram aquele momento especial.",

    "Foste tu. Porque quando estou contigo, até um simples passeio pela rua acaba por se transformar numa memória bonita.",

    "img/momento5.jpeg"
  ],

  [
    "a nossa pequena família",

    "Gosto desta fotografia porque parece mostrar um bocadinho daquilo que somos quando estamos juntos.",

    "Tu, eu e a minha cadela entre nós, num daqueles momentos simples que acabam por significar muito mais do que parecem.",

    "Gosto de imaginar quantos momentos destes ainda vamos viver e de pensar em todas as pequenas memórias que ainda vamos criar.",

    "Porque, sem darmos conta, estamos a construir algo nosso, feito destes pequenos momentos.",

    "img/momento6.jpeg"
  ],

  [
    "quando tudo ainda estava a começar",

    "Olho para esta fotografia e lembro-me de quando ainda estávamos a descobrir o que podíamos ser um para o outro.",

    "Tu no meu colo, eu a brincar contigo e aquela vontade de estar cada vez mais perto de ti.",

    "É engraçado pensar em como tudo começou e perceber o quanto crescemos desde esses primeiros encontros.",

    "Se pudesse voltar atrás, acho que faria exatamente o mesmo... aproximava-me de ti e aproveitava cada segundo.",

    "img/momento7.jpeg"
  ],

  [
    "um dia simples · contigo",

    "Há dias que não precisam de nada de especial para ficarem guardados.",

    "Irmos ver o mar, mais a minha cadela e simplesmente aproveitar a companhia uns dos outros foi mais do que suficiente.",

    "Gosto destes momentos porque não há grandes planos e não precisamos de estar a fazer nada extraordinário.",

    "Só tu, eu, o mar e mais uma memória nossa para guardar.",

    "img/momento8.jpeg"
  ],

  [
    "sempre contigo",

    "Mesmo quando estamos simplesmente a caminho do carro, consigo encontrar uma maneira de transformar o momento numa brincadeira.",

    "Levar-te às cavalitas pode parecer uma coisa pequena, mas são estas pequenas coisas que fazem parte da nossa maneira de estar juntos.",

    "Gosto de poder brincar contigo, pegar em ti, fazer-te rir e aproveitar estes momentos sem pensar em demasiado.",

    "Quero continuar a ter contigo esta liberdade de sermos nós, mesmo nas coisas mais simples.",

    "img/momento9.jpeg"
  ],

  [
    "onde tudo começou",

    "Um dos nossos primeiros encontros e uma memória que ainda hoje me faz sorrir.",

    "Piquenique, um caderno e nós os dois a conhecermo-nos cada vez melhor.",

    "Na altura talvez não soubéssemos tudo aquilo que ainda íamos viver, mas já havia qualquer coisa em nós que me fazia querer continuar a descobrir-te.",

    "Gosto de olhar para trás e pensar que, naquele dia tão simples, estava a começar uma das histórias mais bonitas da minha vida.",

    "img/momento11.jpeg"
  ],

  [
    "treinar contigo",

    "Até os treinos ficam diferentes quando és tu que estás ao meu lado.",

    "Gosto de partilhar contigo estas pequenas partes da minha vida e de te ter por perto mesmo nas coisas mais normais do meu dia.",

    "Porque não quero viver contigo apenas os grandes momentos. Quero também viver contigo os pequenos.",

    "",

    "img/momento12.jpeg"
  ],

  [
    "um passeio nosso",

    "Um daqueles dias simples em que juntámos pessoas e coisas importantes para nós e simplesmente fomos aproveitar o dia.",

    "A minha irmã, a minha cadela, tu e um passeio pelo parque. Nada de extraordinário, mas cheio de pequenas coisas que gosto de recordar.",

    "Gosto de te ver integrada na minha vida e de poder partilhar contigo as pessoas e os lugares que fazem parte dela.",

    "Porque, aos poucos, deixaste de ser apenas alguém que eu amo e passaste a fazer parte de tantos bocadinhos da minha vida.",

    "img/momento13.jpeg"
  ],

  [
    "um bocadinho de paz",

    "Há uma tranquilidade especial em estar contigo junto ao mar, sem precisar de fazer mais nada.",

    "É engraçado como consigo descansar tão bem quando estou contigo. Talvez porque, ao teu lado, sinto que estou num lugar onde posso simplesmente desligar do mundo.",

    "E se há uma coisa que quero continuar a ter contigo, são muitos mais momentos simples, tranquilos e nossos.",

    "",

    "img/momento15.jpeg"
  ]

];

let mi = 0;


// =========================================================
// RENDER MEMORY
// =========================================================

function renderMemory() {

  const m = memories[mi];

  $("#memoryPill").textContent = m[0];
  $("#memoryTitle").textContent = m[1];

  // Textos
  $("#memoryP1").textContent = m[2];
  $("#memoryP2").textContent = m[3];

  // Terceiro parágrafo, caso exista no HTML
  if ($("#memoryP3")) {
    $("#memoryP3").textContent = m[4];
  }

  // =======================================================
  // CORREÇÃO PRINCIPAL:
  // A IMAGEM ESTÁ NO m[5], NÃO NO m[4]
  // =======================================================

  $("#memoryImage").src = m[5];

  // Número da memória
  $("#memoryNumber").textContent =
    `${String(mi + 1).padStart(2, "0")} / ${String(memories.length).padStart(2, "0")}`;
}


// =========================================================
// BOTÃO ANTERIOR
// =========================================================

$("#memoryPrev").onclick = () => {

  mi = (mi - 1 + memories.length) % memories.length;

  renderMemory();
};


// =========================================================
// BOTÃO SEGUINTE
// =========================================================

$("#memoryNext").onclick = () => {

  mi = (mi + 1) % memories.length;

  renderMemory();
};


// =========================================================
// GUARDAR MEMÓRIA
// =========================================================

$("#memorySave").onclick = () => {

  openModal(
    "📸",
    "Memória guardada.",
    "<p>Mais uma pequena memória nossa ficou guardada neste cantinho.</p>"
  );

  once(
    `memory-${mi}`,
    1,
    "memória guardada"
  );
};


// =========================================================
// INICIALIZAR
// =========================================================

renderMemory();


  // =========================================================
  // ROOM
  // =========================================================

  const roomData = {
    lamp: [
      "💡",
      "Luz calma",
      `<p>Agora imagina a luz baixinha, a sala quente e uma noite sem pressa.</p>
       <p><b>Era assim que queria que te sentisses aqui.</b></p>`
    ],

    frame: [
      "📸",
      "Nós",
      `<img src="img/fotoroom.jpeg" alt="Nós" class="modal-photo">
       <p>Uma fotografia que quero repetir muitas, muitas vezes.</p>`
    ],

    sofa: [
      "🛋️",
      "O nosso lugar",
      `<p>Se estivéssemos aqui agora, provavelmente estávamos abraçados, a ver qualquer coisa na televisao.</p>`
    ],

    tv: [
      "📺",
      "Noite de filmes",
      `<p>Ressaca · Vestida para Casar · Diário de uma Paixão</p>
       <p>Um sofá, qualquer coisa para comer e tu ao meu lado.</p>`
    ],

    letter: [
      "💌",
      "Encontraste uma carta.",
      `<p>Não precisavas de estar triste para a abrir.</p>
       <p>Às vezes basta precisares de te lembrar de que existe alguém que te ama muito.</p>`
    ],

    secret: [
      "🔐",
      "Hmm...",
      `<p>Estavas mesmo a explorar tudo. 👀</p>
       <p>Gosto disso, mas há uma surpresa maior escondida noutro sítio.</p>`
    ],

    plant: [
      "🌿",
      "Nós",
      `<p>Gosto de pensar em nós como esta planta: pequena no início, mas cada vez mais forte com cuidado, tempo e carinho.</p>`
    ],

    bear: [
      "🧸",
      "Abraço de emergência",
      `<p>Não me substitui. Nem de perto. 😂</p>
       <p>Mas podes abraçá-lo por mim.</p>`
    ]
  };

  $("#room").addEventListener("click", e => {
    const b = e.target.closest("[data-room]");

    if (!b) return;

    const d = roomData[b.dataset.room];

    openModal(
      d[0],
      d[1],
      d[2]
    );

    once(
      `room-${b.dataset.room}`,
      2,
      "descoberta na sala"
    );

    if (b.dataset.room === "lamp") {
      $("#room").classList.toggle("lit");
    }
  });

  // =========================================================
  // SECRETS
  // =========================================================

  const secrets = [
    [
      "🤫",
      "Quando olho para ti",
      "Às vezes ainda penso na sorte que tive por te encontrar."
    ],

    [
      "💬",
      "As tuas mensagens",
      "Quando me contas o teu dia, sinto-me perto de ti mesmo quando estou longe."
    ],

    [
      "🌴",
      "Uma viagem contigo",
      "Quero um lugar bonito, quente, longe da confusão e só nosso."
    ],

    [
      "😂",
      "Nós sem filtros",
      "Amo poder ser completamente 'autista' contigo e sentir-me em casa."
    ],

    [
      "🏠",
      "O que imagino",
      "Uma casa nossa. Uma vida nossa. Pequenas coisas que significam tudo."
    ],

    [
      "🫶",
      "Uma coisa que quero que saibas",
      "Não tens de merecer o meu carinho. Ele já é todo teu."
    ],

    [
      "🔎",
      "Ainda estás aqui?",
      "Então mereces mais uma: gosto muito mais de nós do que qualquer site conseguiria explicar."
    ]
  ];

  $("#secretsGrid").innerHTML = secrets.map((x, i) =>
    `<button class="secret-card" data-secret="${i}">
      <span>${x[0]}</span>
      <b>${x[1]}</b>
      <small>${x[2]}</small>
    </button>`
  ).join("");

  $("#secretsGrid").addEventListener("click", e => {
    const b = e.target.closest("[data-secret]");

    if (!b) return;

    const x = secrets[+b.dataset.secret];

    openModal(
      x[0],
      x[1],
      `<p>${x[2]}</p>`
    );

    once(
      `secret-${b.dataset.secret}`,
      2,
      "segredo descoberto"
    );
  });

  // =========================================================
  // GARDEN
  // =========================================================

  const rewards = [
    [10, "🌱", "O primeiro segredo"],
    [25, "📸", "Uma memória especial"],
    [50, "💌", "Uma carta escondida"],
    [75, "🎁", "Uma surpresa"],
    [100, "❤️", "O próximo date"],
    [150, "💍", "O maior segredo"]
  ];

  const rewardData = {
    10: [
      "🤫",
      "Um segredo meu",
      "<p>Às vezes olho para ti e penso simplesmente como é que tive tanta sorte em ter uma princesa como tu?</p>"
    ],

    25: [
      "📸",
      "Uma memória nossa",
      `<img src=".jpeg" alt="Memória nossa" class="modal-photo">
       <p>Quero encher a nossa história de fotografias assim.</p>`
    ],

    50: [
      "💌",
      "Uma carta só para ti",
      `<p>Fiz este lugar porque queria deixar aqui um bocadinho de mim para ti.</p>
       <p><b>Eu escolheria-te outra vez. ❤️</b></p>`
    ],

    75: [
      "🎁",
      "Surpresa",
      `<p>Esta não se lê. Esta vive-se. Há uma coisa que quero preparar para nós. Avisa-me quando chegares aqui.👀❤️</p>`
    ],

    100: [
      "❤️",
      "O nosso próximo date",
      `<p>Não vou contar tudo. Só quero que saibas que estou a preparar uma coisa bonita para nós. Avisa-me quando chegares aqui.</p>`
    ],

    150: [
      "💍",
      "O maior segredo",
      `<p>Quando penso no futuro, vejo uma casa nossa, viagens, aventuras, uma família linda e muitos anos a escolher-te todos os dias. (O pedido de casamento ja esta pensado 👀)</p>`
    ]
  };

  function renderRewards() {
    const r = $("#rewards");

    if (!r) return;

    r.innerHTML = rewards.map(x => {
      const ok = state.stars >= x[0];

      return `
        <button class="reward ${ok ? "" : "locked"}" data-reward="${x[0]}">
          <span>${x[1]} <b>${x[2]}</b></span>
          <small>${ok ? "DESBLOQUEADO" : "🔒 " + x[0] + " ⭐"}</small>
        </button>
      `;
    }).join("");

    const next =
      rewards.find(x => state.stars < x[0]);

    $("#nextReward").innerHTML = next
      ? `<span>próxima descoberta</span>
         <b>${next[1]} ${next[2]}</b>
         <small>faltam ${next[0] - state.stars} estrelas</small>`
      : `<span>jardim completo</span>
         <b>🌳 Chegámos ao fim… por agora.</b>
         <small>Mas a nossa história continua.</small>`;
  }

  $("#rewards").addEventListener("click", e => {
    const b = e.target.closest("[data-reward]");

    if (!b) return;

    const n = +b.dataset.reward;

    if (state.stars < n) {
      return toast(
        `Ainda faltam ${n - state.stars} estrelas. ❤️`
      );
    }

    const d = rewardData[n];

    openModal(
      d[0],
      d[1],
      d[2]
    );
  });

  const fire = $("#fireflies");

  for (let i = 0; i < 18; i++) {
    const s = document.createElement("i");

    s.style.left = Math.random() * 100 + "%";
    s.style.top =
      (20 + Math.random() * 65) + "%";

    s.style.animationDelay =
      (Math.random() * 6) * -1 + "s";

    fire.appendChild(s);
  }

  // =========================================================
  // RESPIRAÇÃO
  // =========================================================

  const breathStart = $("#breathStart");
  const breathOrb = $("#breathOrb");
  const breathWord = $("#breathWord");
  const breathTime = $("#breathTime");
  const breathLine = $("#breathLine");
  const breathDots = $("#breathDots");

  let breathing = false;
  let breathCycle = 0;

  if (
    breathStart &&
    breathOrb &&
    breathWord &&
    breathTime &&
    breathLine &&
    breathDots
  ) {

    // Criar os pontos

    breathDots.innerHTML = `
      <i></i>
      <i></i>
      <i></i>
    `;

    breathStart.addEventListener("click", () => {

      console.log("❤️ BOTÃO RESPIRAR CLICADO!");

      if (breathing) return;

      breathing = true;
      breathCycle = 0;

      breathStart.disabled = true;
      breathStart.textContent = "A respirar...";

      // Limpar pontos

      [...breathDots.children].forEach(dot => {
        dot.classList.remove("done");
      });

      startBreathingCycle();
    });

    function startBreathingCycle() {

      // =========================
      // INSPIRA
      // =========================

      breathWord.textContent = "Inspira";
      breathTime.textContent = "devagar";

      breathLine.textContent =
        "Enche o peito devagar. Não tens pressa.";

      breathOrb.className = "breath-orb in";

      setTimeout(() => {

        // =========================
        // FICA
        // =========================

        breathWord.textContent = "Fica...";
        breathTime.textContent = "aqui comigo";

        breathLine.textContent =
          "Está tudo bem. Fica só mais um pouco.";

        breathOrb.className = "breath-orb in";

        setTimeout(() => {

          // =========================
          // SOLTA
          // =========================

          breathWord.textContent = "Solta";
          breathTime.textContent = "devagar";

          breathLine.textContent =
            "Deixa sair tudo o que não precisas de carregar agora.";

          breathOrb.className = "breath-orb out";

          setTimeout(() => {

            // =========================
            // MUITO BEM
            // =========================

            breathWord.textContent = "Muito bem";
            breathTime.textContent = "❤️";

            breathLine.textContent =
              "Isso. Um momento de cada vez.";

            breathOrb.className = "breath-orb out";

            setTimeout(() => {

              breathCycle++;

              // Acender ponto

              if (breathDots.children[breathCycle - 1]) {
                breathDots.children[breathCycle - 1]
                  .classList.add("done");
              }

              // =========================
              // TERMINOU 3 CICLOS
              // =========================

              if (breathCycle >= 3) {

                breathWord.textContent = "Conseguiste";
                breathTime.textContent = "❤️";

                breathLine.textContent =
                  "Já passou mais uma vez. Podes ficar aqui o tempo que precisares.";

                breathOrb.className = "breath-orb";

                breathStart.disabled = false;
                breathStart.textContent = "Respirar novamente";

                breathing = false;

                console.log("🎉 Respiração terminada!");

                once(
                  "breathing",
                  3,
                  "respiração concluída"
                );

                return;
              }

              // Próximo ciclo

              startBreathingCycle();

            }, 1200);

          }, 5000);

        }, 2000);

      }, 4000);
    }

  } else {

    console.error(
      "❌ Elementos da respiração não encontrados."
    );
  }

  // =========================================================
  // CONSTELLATION
  // =========================================================

  const stars = [
    [
      "✦",
      18,
      22,
      "O início",
      "Tudo começou com uma conversa que parecia pequena. E olha onde chegámos. ❤️"
    ],

    [
      "✧",
      35,
      38,
      "20 · 12 · 2025",
      "O dia em que oficialmente começámos a ser nós."
    ],

    [
      "✦",
      52,
      20,
      "Um detalhe",
      "Gosto quando me contas pequenas coisas do teu dia. Fazem-me sentir perto de ti."
    ],

    [
      "✧",
      72,
      30,
      "Uma promessa",
      "Mesmo nos dias confusos, quero que saibas que podes vir até mim."
    ],

    [
      "✦",
      82,
      52,
      "Nós",
      "A minha parte favorita da vida é poder dizer com muito orgulho “nós”."
    ],

    [
      "✧",
      62,
      68,
      "Uma viagem",
      "Ainda quero ver muitos lugares e partilhar os melhores momentos contigo."
    ],

    [
      "✦",
      42,
      78,
      "Casa",
      "Imagino uma casa nossa cheia de pequenas coisas que só fazem sentido para nós."
    ],

    [
      "✧",
      22,
      64,
      "Rir",
      "Quero continuar a fazer-te rir quando menos esperares."
    ],

    [
      "✦",
      88,
      78,
      "Futuro",
      "Há capítulos que ainda nem conseguimos imaginar. E isso é bonito."
    ],

    [
      "✧",
      54,
      48,
      "Segredo",
      "Se encontraste esta estrela: eu escolheria-te outra vez. ❤️"
    ]
  ];

  const cmap = $("#constellationMap");

  stars.forEach((it, i) => {

    const b = document.createElement("button");

    b.className = "constellation-star";
    b.textContent = it[0];

    b.style.left = it[1] + "%";
    b.style.top = it[2] + "%";

    b.setAttribute(
      "aria-label",
      it[3]
    );

    b.onclick = () => {

      $$(".constellation-star")
        .forEach(x =>
          x.classList.remove("found")
        );

      b.classList.add("found");

      $("#constellationNote").textContent =
        it[3] + " — " + it[4];

      once(
        `constellation-${i}`,
        1,
        "estrela descoberta"
      );
    };

    cmap.appendChild(b);
  });

  function drawConstellation() {

    const lines =
      $(".constellation-lines");

    if (!lines) return;

    lines.innerHTML = "";

    const ss =
      $$(".constellation-star");

    for (
      let i = 0;
      i < ss.length - 1;
      i++
    ) {

      const a = ss[i];
      const b = ss[i + 1];

      const x1 =
        a.offsetLeft +
        a.offsetWidth / 2;

      const y1 =
        a.offsetTop +
        a.offsetHeight / 2;

      const x2 =
        b.offsetLeft +
        b.offsetWidth / 2;

      const y2 =
        b.offsetTop +
        b.offsetHeight / 2;

      const dx = x2 - x1;
      const dy = y2 - y1;

      const len =
        Math.hypot(dx, dy);

      const l =
        document.createElement("i");

      l.className =
        "constellation-line";

      l.style.width =
        len + "px";

      l.style.left =
        x1 + "px";

      l.style.top =
        y1 + "px";

      l.style.transform =
        `rotate(${Math.atan2(dy, dx)}rad)`;

      lines.appendChild(l);
    }
  }

  window.addEventListener(
    "resize",
    drawConstellation
  );

  // =========================================================
  // FINALE
  // =========================================================

  function checkFinal() {

    if (
      state.stars >= 75 ||
      Object.keys(state.seen).length >= 18
    ) {

      const nav =
        $$("[data-go='finale']");

      nav.forEach(x =>
        x.removeAttribute("hidden")
      );
    }
  }

  $("#finaleBtn").onclick = () => {

    once(
      "finale",
      5,
      "momento guardado"
    );

    openModal(
      "❤️",
      "Fica com isto.",
      `<p class="modal-big">
        Sempre que voltares aqui, lembra-te de uma coisa:
       </p>
       <p>não precisas de enfrentar cada momento sozinha.</p>
       <p><b>Eu amo-te. — Afonso</b></p>`
    );
  };

  // =========================================================
  // TEMA
  // =========================================================

  function applyTheme() {

    $("html").classList.toggle(
      "night",
      state.night
    );

    $("#nightBtn").setAttribute(
      "aria-pressed",
      String(state.night)
    );
  }

  $("#nightBtn").onclick = () => {

    state.night = !state.night;

    save();
    applyTheme();
  };

  // =========================================================
  // SPOTIFY CONFIGURATION
  // =========================================================

  const SPOTIFY_CLIENT_ID =
    "00fc8e6e712644c49dbc428a868967f2";

  const SPOTIFY_REDIRECT_URI =
    "http://127.0.0.1:5500";

  const SPOTIFY_PLAYLIST_URI =
    "spotify:playlist:7mO0hKpQNaLoEVvxzclCXt";

  const SPOTIFY_SCOPES =
    "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state";

  let spotifyPlayer = null;
  let spotifyDeviceId = null;
  let spotifyToken = null;
  let spotifyTokenExpiresAt = 0;
  let spotifyStarted = false;

  // =========================================================
  // PKCE
  // =========================================================

  function randomString(length = 64) {

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

    const values =
      new Uint8Array(length);

    crypto.getRandomValues(values);

    return [...values]
      .map(v => chars[v % chars.length])
      .join("");
  }

  async function sha256(value) {

    return await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value)
    );
  }

  function base64Url(buffer) {

    return btoa(
      String.fromCharCode(
        ...new Uint8Array(buffer)
      )
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  // =========================================================
  // LOGIN SPOTIFY
  // =========================================================

  async function loginSpotify() {

    const verifier =
      randomString(64);

    const challenge =
      base64Url(
        await sha256(verifier)
      );

    const stateValue =
      randomString(32);

    sessionStorage.setItem(
      "spotify_code_verifier",
      verifier
    );

    sessionStorage.setItem(
      "spotify_auth_state",
      stateValue
    );

    const params =
      new URLSearchParams({
        response_type: "code",
        client_id: SPOTIFY_CLIENT_ID,
        scope: SPOTIFY_SCOPES,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        state: stateValue,
        code_challenge_method: "S256",
        code_challenge: challenge
      });

    window.location.href =
      "https://accounts.spotify.com/authorize?" +
      params.toString();
  }

  // =========================================================
  // TROCAR CODE POR TOKEN
  // =========================================================

  async function exchangeSpotifyCode(code) {

    const verifier =
      sessionStorage.getItem(
        "spotify_code_verifier"
      );

    if (!verifier) {
      throw new Error(
        "Código PKCE não encontrado."
      );
    }

    const response =
      await fetch(
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          },

          body: new URLSearchParams({
            client_id: SPOTIFY_CLIENT_ID,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: SPOTIFY_REDIRECT_URI,
            code_verifier: verifier
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error_description ||
        "Erro ao autenticar no Spotify."
      );
    }

    spotifyToken =
      data.access_token;

    spotifyTokenExpiresAt =
      Date.now() +
      ((data.expires_in || 3600) - 60) * 1000;

    localStorage.setItem(
      "spotify_access_token",
      spotifyToken
    );

    localStorage.setItem(
      "spotify_expires_at",
      String(spotifyTokenExpiresAt)
    );

    if (data.refresh_token) {
      localStorage.setItem(
        "spotify_refresh_token",
        data.refresh_token
      );
    }

    sessionStorage.removeItem(
      "spotify_code_verifier"
    );

    sessionStorage.removeItem(
      "spotify_auth_state"
    );
  }

  // =========================================================
  // REFRESH TOKEN
  // =========================================================

  async function refreshSpotifyToken() {

    const refreshToken =
      localStorage.getItem(
        "spotify_refresh_token"
      );

    if (!refreshToken) {
      return false;
    }

    const response =
      await fetch(
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          },

          body: new URLSearchParams({
            client_id: SPOTIFY_CLIENT_ID,
            grant_type: "refresh_token",
            refresh_token: refreshToken
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      return false;
    }

    spotifyToken =
      data.access_token;

    spotifyTokenExpiresAt =
      Date.now() +
      ((data.expires_in || 3600) - 60) * 1000;

    localStorage.setItem(
      "spotify_access_token",
      spotifyToken
    );

    localStorage.setItem(
      "spotify_expires_at",
      String(spotifyTokenExpiresAt)
    );

    if (data.refresh_token) {
      localStorage.setItem(
        "spotify_refresh_token",
        data.refresh_token
      );
    }

    return true;
  }

  // =========================================================
  // OBTER TOKEN
  // =========================================================

  async function getSpotifyToken() {

    if (
      spotifyToken &&
      Date.now() < spotifyTokenExpiresAt
    ) {
      return spotifyToken;
    }

    const savedToken =
      localStorage.getItem(
        "spotify_access_token"
      );

    const savedExpiry =
      Number(
        localStorage.getItem(
          "spotify_expires_at"
        ) || 0
      );

    if (
      savedToken &&
      Date.now() < savedExpiry
    ) {

      spotifyToken = savedToken;
      spotifyTokenExpiresAt = savedExpiry;

      return spotifyToken;
    }

    if (
      await refreshSpotifyToken()
    ) {
      return spotifyToken;
    }

    return null;
  }

  // =========================================================
  // SPOTIFY API
  // =========================================================

  async function spotifyApi(
    path,
    options = {}
  ) {

    let token =
      await getSpotifyToken();

    if (!token) {
      throw new Error(
        "Spotify não está autenticado."
      );
    }

    let response =
      await fetch(
        "https://api.spotify.com/v1" + path,
        {
          ...options,

          headers: {
            "Authorization":
              "Bearer " + token,

            "Content-Type":
              "application/json",

            ...(options.headers || {})
          }
        }
      );

    if (response.status === 401) {

      const refreshed =
        await refreshSpotifyToken();

      if (!refreshed) {
        throw new Error(
          "A sessão do Spotify expirou."
        );
      }

      token = spotifyToken;

      response =
        await fetch(
          "https://api.spotify.com/v1" + path,
          {
            ...options,

            headers: {
              "Authorization":
                "Bearer " + token,

              "Content-Type":
                "application/json",

              ...(options.headers || {})
            }
          }
        );
    }

    return response;
  }

  // =========================================================
  // INICIAR PLAYLIST
  // =========================================================

  async function playSpotifyPlaylist() {

    if (
      !spotifyPlayer ||
      !spotifyDeviceId
    ) {

      toast(
        "O Spotify ainda está a preparar a música. 🎵"
      );

      return false;
    }

    try {

      spotifyPlayer.activateElement();

      const response =
        await spotifyApi(
          "/me/player/play?device_id=" +
          encodeURIComponent(
            spotifyDeviceId
          ),
          {
            method: "PUT",

            body: JSON.stringify({
              context_uri:
                SPOTIFY_PLAYLIST_URI
            })
          }
        );

      if (!response.ok) {

        const text =
          await response.text();

        throw new Error(
          text ||
          "Não foi possível iniciar a playlist."
        );
      }

      spotifyStarted = true;

      return true;

    } catch (error) {

      console.error(
        "Spotify playback error:",
        error
      );

      toast(
        "Não foi possível iniciar a música. 🎵"
      );

      return false;
    }
  }

  // =========================================================
  // CRIAR PLAYER SPOTIFY
  // =========================================================

  async function initSpotifyPlayer() {

    if (spotifyPlayer) {
      return;
    }

    const token =
      await getSpotifyToken();

    if (!token) {
      return;
    }

    if (!window.Spotify) {

      toast(
        "O Spotify ainda está a carregar. Tenta novamente. 🎵"
      );

      return;
    }

    spotifyPlayer =
      new Spotify.Player({

        name:
          "Cantinho da Lara ❤️",

        volume:
          0.25,

        getOAuthToken:
          async callback => {

            const freshToken =
              await getSpotifyToken();

            callback(
              freshToken || ""
            );
          }
      });

    spotifyPlayer.addListener(
      "ready",
      ({ device_id }) => {

        spotifyDeviceId =
          device_id;

        toast(
          "Spotify pronto. Carrega no ♪ para ouvir. 🎵"
        );
      }
    );

    spotifyPlayer.addListener(
      "not_ready",
      ({ device_id }) => {

        if (
          spotifyDeviceId ===
          device_id
        ) {
          spotifyDeviceId = null;
        }
      }
    );

    spotifyPlayer.addListener(
      "initialization_error",
      ({ message }) => {

        console.error(
          "Spotify initialization error:",
          message
        );

        toast(
          "Não foi possível iniciar o Spotify."
        );
      }
    );

    spotifyPlayer.addListener(
      "authentication_error",
      ({ message }) => {

        console.error(
          "Spotify authentication error:",
          message
        );

        spotifyPlayer = null;
        spotifyDeviceId = null;

        toast(
          "A autenticação do Spotify falhou."
        );
      }
    );

        // =========================================================
    // SPOTIFY — ERROS
    // =========================================================

    spotifyPlayer.addListener(
      "account_error",
      ({ message }) => {

        console.error(
          "Spotify account error:",
          message
        );

        toast(
          "É necessária uma conta Spotify Premium."
        );
      }
    );


    spotifyPlayer.addListener(
      "playback_error",
      ({ message }) => {

        console.error(
          "Spotify playback error:",
          message
        );

        toast(
          "O Spotify não conseguiu reproduzir a música."
        );
      }
    );


    spotifyPlayer.addListener(
      "autoplay_failed",
      () => {

        toast(
          "Carrega novamente no botão para começar a música. 🎵"
        );
      }
    );


    spotifyPlayer.addListener(
      "player_state_changed",
      playerState => {

        if (!playerState) {
          return;
        }


        const playing =
          !playerState.paused;


        $("#soundBtn").textContent =
          playing ? "♫" : "♪";


        $("#soundBtn").setAttribute(
          "aria-pressed",
          String(playing)
        );


        soundOn = playing;

      }
    );


    await spotifyPlayer.connect();

  }


  // =========================================================
  // CALLBACK DO SPOTIFY
  // =========================================================

  async function handleSpotifyCallback() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    const code =
      params.get("code");


    const returnedState =
      params.get("state");


    const error =
      params.get("error");


    if (error) {

      toast(
        "O acesso ao Spotify foi cancelado."
      );


      history.replaceState(
        {},
        document.title,
        window.location.pathname
      );


      return;

    }


    if (!code) {
      return;
    }


    const savedState =
      sessionStorage.getItem(
        "spotify_auth_state"
      );


    if (
      !savedState ||
      savedState !== returnedState
    ) {

      console.error(
        "Spotify state mismatch."
      );


      toast(
        "Não foi possível validar o Spotify."
      );


      history.replaceState(
        {},
        document.title,
        window.location.pathname
      );


      return;

    }


    try {

      await exchangeSpotifyCode(
        code
      );


      toast(
        "Spotify ligado! Agora carrega no ♪ 🎵"
      );


    } catch (error) {

      console.error(
        "Spotify callback error:",
        error
      );


      toast(
        "Não foi possível ligar o Spotify."
      );

    }


    history.replaceState(
      {},
      document.title,
      window.location.pathname
    );


    if (window.Spotify) {

      await initSpotifyPlayer();

    }

  }


  // =========================================================
  // BOTÃO DE MÚSICA
  // =========================================================

  let soundOn = false;


  $("#soundBtn").onclick =
    async () => {

      try {

        const token =
          await getSpotifyToken();


        // ---------------------------------------------------
        // PRIMEIRA VEZ
        // ---------------------------------------------------

        if (!token) {

          toast(
            "A ligar ao Spotify… 🎵"
          );


          await loginSpotify();

          return;

        }


        // ---------------------------------------------------
        // CRIAR PLAYER
        // ---------------------------------------------------

        if (!spotifyPlayer) {

          await initSpotifyPlayer();

        }


        // ---------------------------------------------------
        // ESPERAR PELO DISPOSITIVO
        // ---------------------------------------------------

        if (
          !spotifyPlayer ||
          !spotifyDeviceId
        ) {

          toast(
            "O Spotify ainda está a preparar-se. Tenta novamente. 🎵"
          );


          return;

        }


        // ---------------------------------------------------
        // ESTADO ATUAL
        // ---------------------------------------------------

        const currentState =
          await spotifyPlayer.getCurrentState();


        // ---------------------------------------------------
        // PAUSAR
        // ---------------------------------------------------

        if (
          currentState &&
          !currentState.paused
        ) {

          await spotifyPlayer.pause();


          soundOn = false;


          $("#soundBtn").textContent =
            "♪";


          $("#soundBtn").setAttribute(
            "aria-pressed",
            "false"
          );


          return;

        }


        // ---------------------------------------------------
        // COMEÇAR MÚSICA
        // ---------------------------------------------------

        const started =
          await playSpotifyPlaylist();


        if (started) {

          soundOn = true;


          $("#soundBtn").textContent =
            "♫";


          $("#soundBtn").setAttribute(
            "aria-pressed",
            "true"
          );


          toast(
            "A nossa música começou. 🌙"
          );

        }

      } catch (error) {

        console.error(
          "Spotify error:",
          error
        );


        soundOn = false;


        $("#soundBtn").textContent =
          "♪";


        $("#soundBtn").setAttribute(
          "aria-pressed",
          "false"
        );


        toast(
          "Não foi possível ligar ao Spotify. 🎵"
        );

      }

    };


  // =========================================================
  // SPOTIFY SDK CALLBACK
  // =========================================================

  window.onSpotifyWebPlaybackSDKReady =
    () => {

      const token =
        localStorage.getItem(
          "spotify_access_token"
        );


      if (token) {

        initSpotifyPlayer()
          .catch(error => {

            console.error(
              "Spotify init error:",
              error
            );

          });

      }

    };


  // =========================================================
  // VERIFICAR CALLBACK SPOTIFY
  // =========================================================

  handleSpotifyCallback();


  // =========================================================
  // PARALLAX
  // =========================================================

  const hero =
    $("#heroScene");


  if (
    hero &&
    !matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {

    hero.addEventListener(
      "pointermove",
      e => {

        const r =
          hero.getBoundingClientRect();


        const x =
          (e.clientX - r.left) /
          r.width - 0.5;


        const y =
          (e.clientY - r.top) /
          r.height - 0.5;


        hero.style.setProperty(
          "--mx",
          x
        );


        hero.style.setProperty(
          "--my",
          y
        );

      }
    );


    hero.addEventListener(
      "pointerleave",
      () => {

        hero.style.setProperty(
          "--mx",
          0
        );


        hero.style.setProperty(
          "--my",
          0
        );

      }
    );

  }


  // =========================================================
  // START DO SITE
  // =========================================================

  applyTheme();

  renderMemory();

  updateUI();

  checkFinal();


  requestAnimationFrame(
    drawConstellation
  );


})();


// =============================================================
// DIÁRIO — VERSÃO ÚNICA E CORRIGIDA
// =============================================================

(function initDiary() {

  // -----------------------------------------------------------
  // ELEMENTOS
  // -----------------------------------------------------------

  const dateInput =
    document.getElementById(
      "diaryDate"
    );


  const timeInput =
    document.getElementById(
      "diaryTime"
    );


  const titleInput =
    document.getElementById(
      "diaryTitle"
    );


  // Aceita os dois nomes que tinhas usado
  const contentInput =
    document.getElementById(
      "diaryContent"
    ) ||
    document.getElementById(
      "diaryText"
    );


  // Aceita os dois IDs
  const saveButton =
    document.getElementById(
      "saveDiary"
    ) ||
    document.getElementById(
      "diarySave"
    );


  const entriesContainer =
    document.getElementById(
      "diaryEntries"
    );


  const characters =
    document.getElementById(
      "diaryCharacters"
    );


  const day =
    document.getElementById(
      "diaryDay"
    );


  const month =
    document.getElementById(
      "diaryMonth"
    );


  const year =
    document.getElementById(
      "diaryYear"
    );


  // -----------------------------------------------------------
  // SE O DIÁRIO NÃO EXISTIR NO HTML
  // NÃO FAZER NADA
  // -----------------------------------------------------------

  if (
    !entriesContainer ||
    !saveButton ||
    !titleInput ||
    !contentInput
  ) {

    return;

  }


  // -----------------------------------------------------------
  // CONFIGURAÇÃO
  // -----------------------------------------------------------

  const STORAGE_KEY =
    "nossoCantinho_diary";


  let selectedMood =
    "🥰";


  // -----------------------------------------------------------
  // MESES
  // -----------------------------------------------------------

  const months = [

    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO"

  ];


  // -----------------------------------------------------------
  // SEGURANÇA
  // -----------------------------------------------------------

  function escapeHTML(value) {

    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );

  }


  // -----------------------------------------------------------
  // STORAGE
  // -----------------------------------------------------------

  function getEntries() {

    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );


      if (!saved) {

        return [];

      }


      const entries =
        JSON.parse(
          saved
        );


      if (
        !Array.isArray(
          entries
        )
      ) {

        return [];

      }


      return entries;

    } catch (error) {

      console.error(
        "Erro ao ler o diário:",
        error
      );


      return [];

    }

  }


  function saveEntries(entries) {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entries)
      );


      return true;

    } catch (error) {

      console.error(
        "Erro ao guardar o diário:",
        error
      );


      showDiaryMessage(
        "Não foi possível guardar esta memória."
      );


      return false;

    }

  }


  // -----------------------------------------------------------
  // DATA
  // -----------------------------------------------------------

  function pad(number) {

    return String(
      number
    ).padStart(
      2,
      "0"
    );

  }


  function setCurrentDate() {

    const now =
      new Date();


    if (
      dateInput &&
      !dateInput.value
    ) {

      dateInput.value =
        `${now.getFullYear()}-${pad(
          now.getMonth() + 1
        )}-${pad(
          now.getDate()
        )}`;

    }


    if (
      timeInput &&
      !timeInput.value
    ) {

      timeInput.value =
        `${pad(
          now.getHours()
        )}:${pad(
          now.getMinutes()
        )}`;

    }


    updateCalendar(
      now
    );

  }


  function updateCalendar(date) {

    if (!date) {
      return;
    }


    if (day) {

      day.textContent =
        date.getDate();

    }


    if (month) {

      month.textContent =
        months[
          date.getMonth()
        ];

    }


    if (year) {

      year.textContent =
        date.getFullYear();

    }

  }


  function updateCalendarFromInput() {

    if (
      !dateInput ||
      !dateInput.value
    ) {

      return;

    }


    const date =
      new Date(
        dateInput.value +
        "T12:00:00"
      );


    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {

      updateCalendar(
        date
      );

    }

  }


  if (dateInput) {

    dateInput.addEventListener(
      "change",
      updateCalendarFromInput
    );

  }


  // -----------------------------------------------------------
  // HUMORES
  // -----------------------------------------------------------

  const moodButtons =
    document.querySelectorAll(
      ".mood-option, .mood-btn"
    );


  moodButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          moodButtons.forEach(
            item => {

              item.classList.remove(
                "active"
              );


              item.classList.remove(
                "selected"
              );

            }
          );


          button.classList.add(
            "active"
          );


          button.classList.add(
            "selected"
          );


          selectedMood =
            button.dataset.mood ||
            "🥰";

        }
      );

    }
  );


  // -----------------------------------------------------------
  // CONTADOR
  // -----------------------------------------------------------

  function updateCharacters() {

    if (!characters) {
      return;
    }


    const length =
      contentInput.value.length;


    characters.textContent =
      `${length} / 5000`;

  }


  contentInput.addEventListener(
    "input",
    updateCharacters
  );


  // -----------------------------------------------------------
  // GUARDAR
  // -----------------------------------------------------------

  function saveEntry() {

    const title =
      titleInput.value.trim();


    const content =
      contentInput.value.trim();


    if (!title) {

      showDiaryMessage(
        "Falta um título para este momento. ❤️"
      );


      titleInput.focus();


      return;

    }


    if (!content) {

      showDiaryMessage(
        "Escreve primeiro aquilo que estás a sentir. 🤍"
      );


      contentInput.focus();


      return;

    }


    if (
      content.length >
      5000
    ) {

      showDiaryMessage(
        "O texto não pode ultrapassar 5000 caracteres."
      );


      contentInput.focus();


      return;

    }


    const now =
      new Date();


    const entry = {

      id:
        Date.now() +
        Math.random(),

      date:
        dateInput?.value ||
        `${now.getFullYear()}-${pad(
          now.getMonth() + 1
        )}-${pad(
          now.getDate()
        )}`,

      time:
        timeInput?.value ||
        `${pad(
          now.getHours()
        )}:${pad(
          now.getMinutes()
        )}`,

      mood:
        selectedMood,

      title:
        title,

      content:
        content

    };


    const entries =
      getEntries();


    entries.unshift(
      entry
    );


    if (
      !saveEntries(
        entries
      )
    ) {

      return;

    }


    // ---------------------------------------------------------
    // LIMPAR FORMULÁRIO
    // ---------------------------------------------------------

    titleInput.value = "";

    contentInput.value = "";


    selectedMood =
      "🥰";


    moodButtons.forEach(
      button => {

        button.classList.remove(
          "active"
        );

        button.classList.remove(
          "selected"
        );

      }
    );


    // Voltar a selecionar o primeiro humor,
    // se existir.

    const firstMood =
      document.querySelector(
        ".mood-option, .mood-btn"
      );


    if (firstMood) {

      firstMood.classList.add(
        "active"
      );

      firstMood.classList.add(
        "selected"
      );

    }


    updateCharacters();


    setCurrentDate();


    renderEntries();


    showDiaryMessage(
      "Momento guardado no nosso diário. ❤️"
    );


    // ---------------------------------------------------------
    // SISTEMA DE ESTRELAS
    // ---------------------------------------------------------

    try {

      if (
        typeof window.addStar ===
        "function"
      ) {

        window.addStar();

      }

    } catch (error) {

      console.warn(
        "Não foi possível adicionar estrela:",
        error
      );

    }

  }


  saveButton.addEventListener(
    "click",
    saveEntry
  );


  // -----------------------------------------------------------
  // ENTER / CTRL + ENTER
  // -----------------------------------------------------------

  contentInput.addEventListener(
    "keydown",
    event => {

      if (
        event.ctrlKey &&
        event.key === "Enter"
      ) {

        event.preventDefault();

        saveEntry();

      }

    }
  );


  // -----------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------

  function renderEntries() {

    const entries =
      getEntries();


    if (
      entries.length ===
      0
    ) {

      entriesContainer.innerHTML = `

        <div class="diary-empty">

          <div
            style="
              font-size:34px;
              margin-bottom:12px;
            "
          >
            ♡
          </div>

          <b>
            Ainda não escrevemos nada aqui.
          </b>

          <span>
            Talvez a primeira memória possa ser hoje. 🤍
          </span>

        </div>

      `;


      updateDiaryCount(
        0
      );


      return;

    }


    updateDiaryCount(
      entries.length
    );


    entriesContainer.innerHTML =
      entries
        .map(
          entry => {

            const formattedDate =
              formatDate(
                entry.date
              );


            return `

              <article
                class="diary-entry"
                data-entry-id="${escapeHTML(
                  entry.id
                )}"
              >

                <div
                  class="diary-entry-top"
                >

                  <span
                    class="diary-entry-mood"
                  >
                    ${escapeHTML(
                      entry.mood ||
                      "🥰"
                    )}
                  </span>


                  <span
                    class="diary-entry-date"
                  >

                    ${escapeHTML(
                      formattedDate
                    )}

                    ${
                      entry.time
                        ? ` · ${escapeHTML(
                            entry.time
                          )}`
                        : ""
                    }

                  </span>

                </div>


                <h4>
                  ${escapeHTML(
                    entry.title ||
                    "Uma página nossa"
                  )}
                </h4>


                <p>
                  ${escapeHTML(
                    entry.content ||
                    entry.text ||
                    ""
                  )}
                </p>


                <button
                  type="button"
                  class="diary-entry-delete"
                  data-delete-diary="${escapeHTML(
                    entry.id
                  )}"
                >
                  Apagar esta memória
                </button>

              </article>

            `;

          }
        )
        .join("");


    entriesContainer
      .querySelectorAll(
        "[data-delete-diary]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const id =
                button.dataset.deleteDiary;


              deleteEntry(
                id
              );

            }
          );

        }
      );

  }


  // -----------------------------------------------------------
  // CONTADOR DE ENTRADAS
  // -----------------------------------------------------------

  function updateDiaryCount(
    count
  ) {

    const countElement =
      document.getElementById(
        "diaryCount"
      );


    if (!countElement) {
      return;
    }


    countElement.textContent =
      `${count} ${
        count === 1
          ? "entrada"
          : "entradas"
      }`;

  }


  // -----------------------------------------------------------
  // APAGAR
  // -----------------------------------------------------------

  function deleteEntry(
    id
  ) {

    const confirmed =
      confirm(
        "Queres mesmo apagar esta memória? ❤️"
      );


    if (!confirmed) {
      return;
    }


    const entries =
      getEntries()
        .filter(
          entry =>
            String(
              entry.id
            ) !== String(
              id
            )
        );


    saveEntries(
      entries
    );


    renderEntries();


    showDiaryMessage(
      "Memória apagada."
    );

  }


  // -----------------------------------------------------------
  // FORMATAR DATA
  // -----------------------------------------------------------

  function formatDate(
    dateString
  ) {

    if (!dateString) {

      return "";

    }


    const date =
      new Date(
        dateString +
        "T12:00:00"
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return dateString;

    }


    return new Intl.DateTimeFormat(
      "pt-PT",
      {
        day:
          "2-digit",

        month:
          "long",

        year:
          "numeric"
      }
    ).format(
      date
    );

  }


  // -----------------------------------------------------------
  // TOAST
  // -----------------------------------------------------------

  function showDiaryMessage(
    message
  ) {

    const toastElement =
      document.getElementById(
        "toast"
      );


    if (!toastElement) {

      console.log(
        message
      );


      return;

    }


    toastElement.textContent =
      message;


    toastElement.classList.add(
      "show"
    );


    clearTimeout(
      window.diaryToastTimeout
    );


    window.diaryToastTimeout =
      setTimeout(
        () => {

          toastElement.classList.remove(
            "show"
          );

        },
        2800
      );

  }


  // -----------------------------------------------------------
  // INICIALIZAÇÃO
  // -----------------------------------------------------------

  setCurrentDate();

  updateCharacters();

  renderEntries();


})();

/* =========================================================
   📖 DIÁRIO DO NOSSO CANTINHO
   Sistema independente
   ========================================================= */

(function initDiary() {

  "use strict";

  /* =======================================================
     ELEMENTOS
     ======================================================= */

  const dateInput =
    document.getElementById("diaryDate");

  const timeInput =
    document.getElementById("diaryTime");

  const titleInput =
    document.getElementById("diaryTitle");

  const contentInput =
    document.getElementById("diaryContent") ||
    document.getElementById("diaryText");

  const saveButton =
    document.getElementById("saveDiary") ||
    document.getElementById("diarySave");

  const entriesContainer =
    document.getElementById("diaryEntries");

  const characters =
    document.getElementById("diaryCharacters");

  const diaryCount =
    document.getElementById("diaryCount");

  const dayElement =
    document.getElementById("diaryDay");

  const monthElement =
    document.getElementById("diaryMonth");

  const yearElement =
    document.getElementById("diaryYear");


  /* =======================================================
     SE O HTML DO DIÁRIO NÃO EXISTIR
     ======================================================= */

  if (
    !titleInput ||
    !contentInput ||
    !saveButton ||
    !entriesContainer
  ) {

    console.warn(
      "Diário: elementos HTML não encontrados."
    );

    return;

  }


  /* =======================================================
     CONFIGURAÇÃO
     ======================================================= */

  const STORAGE_KEY =
    "nossoCantinho_diary";


  let selectedMood =
    "🥰";


  const months = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO"
  ];


  /* =======================================================
     SEGURANÇA
     ======================================================= */

  function escapeHTML(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  /* =======================================================
     DATA
     ======================================================= */

  function pad(number) {

    return String(number).padStart(
      2,
      "0"
    );

  }


  function getCurrentDate() {

    const now =
      new Date();

    return (
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) +
      "-" +
      pad(now.getDate())
    );

  }


  function getCurrentTime() {

    const now =
      new Date();

    return (
      pad(now.getHours()) +
      ":" +
      pad(now.getMinutes())
    );

  }


  function updateDiaryDate() {

    const now =
      new Date();


    if (
      dateInput &&
      !dateInput.value
    ) {

      dateInput.value =
        getCurrentDate();

    }


    if (
      timeInput &&
      !timeInput.value
    ) {

      timeInput.value =
        getCurrentTime();

    }


    updateCalendar(
      now
    );

  }


  function updateCalendar(date) {

    if (!date) {
      return;
    }


    if (dayElement) {

      dayElement.textContent =
        date.getDate();

    }


    if (monthElement) {

      monthElement.textContent =
        months[
          date.getMonth()
        ];

    }


    if (yearElement) {

      yearElement.textContent =
        date.getFullYear();

    }

  }


  function updateCalendarFromInput() {

    if (
      !dateInput ||
      !dateInput.value
    ) {

      return;

    }


    const date =
      new Date(
        dateInput.value +
        "T12:00:00"
      );


    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {

      updateCalendar(
        date
      );

    }

  }


  if (dateInput) {

    dateInput.addEventListener(
      "change",
      updateCalendarFromInput
    );

  }


  /* =======================================================
     HUMOR
     ======================================================= */

  const moodButtons =
    document.querySelectorAll(
      ".mood-option, .mood-btn"
    );


  moodButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          moodButtons.forEach(
            item => {

              item.classList.remove(
                "active"
              );

              item.classList.remove(
                "selected"
              );

            }
          );


          button.classList.add(
            "active"
          );


          button.classList.add(
            "selected"
          );


          selectedMood =
            button.dataset.mood ||
            "🥰";

        }
      );

    }
  );


  /* =======================================================
     CONTADOR DE CARACTERES
     ======================================================= */

  function updateCharacters() {

    if (!characters) {
      return;
    }


    const length =
      contentInput.value.length;


    characters.textContent =
      `${length} / 5000`;

  }


  contentInput.addEventListener(
    "input",
    updateCharacters
  );


  /* =======================================================
     STORAGE
     ======================================================= */

  function getEntries() {

    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );


      if (!saved) {

        return [];

      }


      const entries =
        JSON.parse(
          saved
        );


      if (
        !Array.isArray(
          entries
        )
      ) {

        return [];

      }


      return entries;

    } catch (error) {

      console.error(
        "Erro ao carregar o diário:",
        error
      );


      return [];

    }

  }


  function saveEntries(
    entries
  ) {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entries)
      );


      return true;

    } catch (error) {

      console.error(
        "Erro ao guardar o diário:",
        error
      );


      showDiaryToast(
        "Não foi possível guardar esta memória. 🤍"
      );


      return false;

    }

  }


  /* =======================================================
     CONTADOR DE ENTRADAS
     ======================================================= */

  function updateDiaryCount(
    amount
  ) {

    if (!diaryCount) {
      return;
    }


    diaryCount.textContent =
      `${amount} ${
        amount === 1
          ? "entrada"
          : "entradas"
      }`;

  }


  /* =======================================================
     GUARDAR MEMÓRIA
     ======================================================= */

  function saveDiaryEntry() {

    const title =
      titleInput.value.trim();


    const content =
      contentInput.value.trim();


    /* -----------------------------------------------------
       VALIDAR TÍTULO
       ----------------------------------------------------- */

    if (!title) {

      showDiaryToast(
        "Dá um título a este momento. ❤️"
      );


      titleInput.focus();


      return;

    }


    /* -----------------------------------------------------
       VALIDAR TEXTO
       ----------------------------------------------------- */

    if (!content) {

      showDiaryToast(
        "Escreve primeiro aquilo que estás a sentir. 🤍"
      );


      contentInput.focus();


      return;

    }


    /* -----------------------------------------------------
       LIMITE
       ----------------------------------------------------- */

    if (
      content.length >
      5000
    ) {

      showDiaryToast(
        "O diário permite no máximo 5000 caracteres."
      );


      contentInput.focus();


      return;

    }


    /* -----------------------------------------------------
       DATA / HORA
       ----------------------------------------------------- */

    const now =
      new Date();


    const date =
      dateInput?.value ||
      getCurrentDate();


    const time =
      timeInput?.value ||
      getCurrentTime();


    /* -----------------------------------------------------
       NOVA MEMÓRIA
       ----------------------------------------------------- */

    const entry = {

      id:
        Date.now() +
        Math.random(),

      date:
        date,

      time:
        time,

      mood:
        selectedMood,

      title:
        title,

      content:
        content

    };


    /* -----------------------------------------------------
       GUARDAR
       ----------------------------------------------------- */

    const entries =
      getEntries();


    entries.unshift(
      entry
    );


    const saved =
      saveEntries(
        entries
      );


    if (!saved) {
      return;
    }


    /* -----------------------------------------------------
       LIMPAR
       ----------------------------------------------------- */

    titleInput.value =
      "";


    contentInput.value =
      "";


    selectedMood =
      "🥰";


    moodButtons.forEach(
      button => {

        button.classList.remove(
          "active"
        );

        button.classList.remove(
          "selected"
        );

      }
    );


    updateCharacters();


    /* -----------------------------------------------------
       RENDER
       ----------------------------------------------------- */

    renderDiary();


    /* -----------------------------------------------------
       MENSAGEM
       ----------------------------------------------------- */

    showDiaryToast(
      "Guardei esta memória no vosso cantinho. ❤️"
    );


    /* -----------------------------------------------------
       ESTRELA
       ----------------------------------------------------- */

    try {

      if (
        typeof window.addStar ===
        "function"
      ) {

        window.addStar();

      }

    } catch (error) {

      console.warn(
        "Sistema de estrelas indisponível.",
        error
      );

    }

  }


  saveButton.addEventListener(
    "click",
    saveDiaryEntry
  );


  /* =======================================================
     CTRL + ENTER PARA GUARDAR
     ======================================================= */

  contentInput.addEventListener(
    "keydown",
    event => {

      if (
        event.ctrlKey &&
        event.key === "Enter"
      ) {

        event.preventDefault();

        saveDiaryEntry();

      }

    }
  );


  /* =======================================================
     FORMATAR DATA
     ======================================================= */

  function formatDiaryDate(
    dateString
  ) {

    if (!dateString) {

      return "";

    }


    const date =
      new Date(
        dateString +
        "T12:00:00"
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return dateString;

    }


    return new Intl.DateTimeFormat(
      "pt-PT",
      {
        day:
          "2-digit",

        month:
          "long",

        year:
          "numeric"
      }
    ).format(
      date
    );

  }


  /* =======================================================
     MOSTRAR DIÁRIO
     ======================================================= */

  function renderDiary() {

    const entries =
      getEntries();


    updateDiaryCount(
      entries.length
    );


    /* -----------------------------------------------------
       SEM MEMÓRIAS
       ----------------------------------------------------- */

    if (
      entries.length ===
      0
    ) {

      entriesContainer.innerHTML = `

        <div class="diary-empty">

          <div
            style="
              font-size:42px;
              margin-bottom:14px;
            "
          >
            ♡
          </div>

          <strong>
            Ainda não escrevemos nada aqui.
          </strong>

          <span>
            A primeira página da nossa história
            pode começar hoje. 🤍
          </span>

        </div>

      `;


      return;

    }


    /* -----------------------------------------------------
       MEMÓRIAS
       ----------------------------------------------------- */

    entriesContainer.innerHTML =
      entries
        .map(
          entry => {

            const title =
              escapeHTML(
                entry.title ||
                "Uma página nossa"
              );


            const content =
              escapeHTML(
                entry.content ||
                entry.text ||
                ""
              );


            const mood =
              escapeHTML(
                entry.mood ||
                "🥰"
              );


            const date =
              escapeHTML(
                formatDiaryDate(
                  entry.date
                )
              );


            const time =
              escapeHTML(
                entry.time ||
                ""
              );


            const id =
              escapeHTML(
                entry.id
              );


            return `

              <article
                class="diary-entry"
                data-diary-entry="${id}"
              >

                <div class="diary-entry-top">

                  <span
                    class="diary-entry-mood"
                  >
                    ${mood}
                  </span>

                  <span
                    class="diary-entry-date"
                  >
                    ${date}

                    ${
                      time
                        ? ` · ${time}`
                        : ""
                    }
                  </span>

                </div>


                <h4>
                  ${title}
                </h4>


                <p>
                  ${content}
                </p>


                <button
                  type="button"
                  class="diary-entry-delete"
                  data-delete-diary="${id}"
                >
                  apagar esta memória
                </button>

              </article>

            `;

          }
        )
        .join("");


    /* -----------------------------------------------------
       BOTÕES APAGAR
       ----------------------------------------------------- */

    entriesContainer
      .querySelectorAll(
        "[data-delete-diary]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              deleteDiaryEntry(
                button.dataset.deleteDiary
              );

            }
          );

        }
      );

  }


  /* =======================================================
     APAGAR
     ======================================================= */

  function deleteDiaryEntry(
    id
  ) {

    const confirmed =
      confirm(
        "Queres mesmo apagar esta memória? ❤️"
      );


    if (!confirmed) {

      return;

    }


    const entries =
      getEntries()
        .filter(
          entry =>
            String(
              entry.id
            ) !==
            String(
              id
            )
        );


    saveEntries(
      entries
    );


    renderDiary();


    showDiaryToast(
      "Memória apagada. 🤍"
    );

  }


  /* =======================================================
     TOAST
     ======================================================= */

  function showDiaryToast(
    message
  ) {

    const toastElement =
      document.getElementById(
        "toast"
      );


    if (!toastElement) {

      console.log(
        "Diário:",
        message
      );


      return;

    }


    toastElement.textContent =
      message;


    toastElement.classList.add(
      "show"
    );


    clearTimeout(
      window.diaryToastTimeout
    );


    window.diaryToastTimeout =
      setTimeout(
        () => {

          toastElement.classList.remove(
            "show"
          );

        },
        2800
      );

  }


  /* =======================================================
     INICIALIZAÇÃO
     ======================================================= */

  updateDiaryDate();

  updateCharacters();

  renderDiary();


})();