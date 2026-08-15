(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const field = $("#starfield");
  for (let i = 0; i < 70; i++) {
    const s = document.createElement("i");
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDelay = (Math.random() * 7) * -1 + "s";
    field.appendChild(s);
  }

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

  const once = (key, n = 1, reason = "") => {
    if (state.seen[key]) return;

    state.seen[key] = 1;
    state.stars = Math.min(150, state.stars + n);

    save();

    if (reason) {
      toast(`+${n} estrela${n > 1 ? "s" : ""} · ${reason} ⭐`);
    }

    checkFinal();
  };

  function updateUI() {
    const count = $("#starCount");
    if (count) count.textContent = state.stars;

    const bar = $("#bar");
    if (bar) bar.style.width = `${state.stars / 150 * 100}%`;

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
        "🌷".repeat(Math.min(10, Math.floor(state.stars / 15)));
    }

    renderRewards();
    renderProgress();
  }

  function renderProgress() {
    const max = 150;
    const p = Math.min(100, state.stars / max * 100);

    const pb = $("#progressBar");
    if (pb) pb.style.width = `${p}%`;

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
    if (b) go(b.dataset.go);
  });

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
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });


  // Opening

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


  // Home navigation

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


  // Safe space

  const safeData = {
    hug: [
      "🫂",
      "O meu abraço",
      `<p>Fecha os olhos por alguns segundos.</p>
       <p>Imagina-me aí. Sem perguntas, sem pressa. Só um abraço longo.</p>
       <p>Fica o tempo que precisares.</p>
       <p><b>Não tens de explicar nada para merecer carinho. ❤️</b></p>`
    ],

    words: [
      "💌",
      "O que eu te diria",
      `<p>Meu amor, isto que estás a sentir não te torna fraca.</p>
       <p>Um momento difícil é apenas um momento. Não é quem tu és, nem define o resto do teu dia.</p>
       <p>Vamos devagar. Eu estou contigo.</p>`
    ],

    ground: [
      "🌿",
      "Volta ao agora",
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
      `<p>Prometo continuar a tentar ser um lugar seguro para ti.</p>
       <p>Não prometo saber sempre o que dizer. Prometo ouvir, ficar e aprender contigo.</p>`
    ],

    night: [
      "🌙",
      "Podemos ficar em silêncio",
      `<p>Não precisas de conversar.</p>
       <p>Imagina-nos os dois no sofá, com a luz baixa, enquanto o mundo abranda lá fora.</p>
       <p>Às vezes companhia também é silêncio.</p>`
    ],

    letter: [
      "💌",
      "Uma carta rápida",
      `<p>Se hoje está pesado, lê só isto:</p>
       <p class="modal-big">
       Eu estou contigo.<br>
       Não precisas de passar por este momento sozinha. ❤️
       </p>`
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


  // Letters

  const letters = [
    [
      "🌧️",
      "Quando estiveres triste",
      "para te lembrares de que não tens de ser forte sempre",
      `<p>Meu amor, não precisas de resolver tudo hoje.</p>
       <p>Se hoje só conseguires respirar e descansar, já chega. Quero que saibas que estou aqui para ti, sem pressa e sem julgamentos.</p>
       <p>Não precisas de ser forte o tempo inteiro. Podes simplesmente ser tu. E eu continuo aqui. ❤️</p>`
    ],

    [
      "🌬️",
      "Quando estiveres nervosa",
      "para quando a cabeça começar a correr",
      `<p>Respira comigo. Devagar.</p>
       <p>Não precisas de imaginar todos os cenários possíveis. Vamos ficar apenas no que está à nossa frente.</p>
       <p>Tu és capaz. E mesmo quando não te sentires assim, eu continuo a acreditar em ti.</p>`
    ],

    [
      "🫂",
      "Quando precisares de um abraço",
      "um abraço meu guardado aqui",
      `<p>Se eu pudesse, estava aí agora.</p>
       <p>Pegava em ti, abraçava-te e ficava contigo sem precisar de dizer nada.</p>
       <p>Fecha os olhos por alguns segundos e imagina-me aí. 🫂❤️</p>`
    ],

    [
      "💭",
      "Quando estiveres a pensar demasiado",
      "nem tudo precisa de uma resposta agora",
      `<p>Às vezes a tua cabeça só precisa de descansar.</p>
       <p>Respira, vai com calma e lembra-te: não precisas de carregar tudo sozinha.</p>`
    ],

    [
      "❤️",
      "Quando precisares de amor",
      "uma coisa simples, para leres devagar",
      `<p class="modal-big">Eu amo-te. Muito. ❤️</p>
       <p>És uma das pessoas mais importantes da minha vida.</p>`
    ],

    [
      "🌙",
      "Quando não conseguires dormir",
      "para uma noite mais tranquila",
      `<p>Imagina que estamos juntos, sem pressa, numa noite tranquila.</p>
       <p>Não precisas de fazer nada. Só respirar e deixar o dia acabar.</p>
       <p>Boa noite, meu amor. 🌙</p>`
    ],

    [
      "✈️",
      "Quando estivermos longe",
      "para os dias de saudade",
      `<p>Tenho saudades tuas.</p>
       <p>A distância é só temporária. Continuo aqui, a pensar em ti e a amar-te exatamente da mesma maneira. ❤️</p>`
    ],

    [
      "☀️",
      "Quando tiveres um dia bom",
      "porque também quero celebrar contigo",
      `<p>Não quero estar contigo apenas nos momentos difíceis.</p>
       <p>Quero rir contigo, ouvir-te contar o teu dia e celebrar as tuas pequenas vitórias.</p>
       <p>Se estás feliz hoje, eu quero estar feliz contigo. ☀️❤️</p>`
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


  // Story

  const chapters = [
    [
      "Instagram",
      "Onde tudo começou.",
      "Começámos a falar pelo Instagram. E, sem sabermos, estávamos a abrir a porta para tudo isto."
    ],
    [
      "Depois do Canadá",
      "O primeiro encontro.",
      "Jardim António Borges, Mac, cocktails no hotel do Casino. Um dia que ficou."
    ],
    [
      "19 · 12 · 2025",
      "O dia antes.",
      "O momento em que percebi seriamente o quanto queria construir qualquer coisa contigo."
    ],
    [
      "20 · 12 · 2025",
      "O começo de nós.",
      "Pedi-te em namoro. E começou oficialmente a nossa história. ❤️"
    ],
    [
      "Os primeiros meses",
      "Saudades enormes.",
      "Aprendemos a querer aproveitar cada minuto juntos."
    ],
    [
      "Primeira noite na tua casa",
      "Uma memória especial.",
      "Um daqueles momentos simples que acabou por significar muito para mim."
    ],
    [
      "Hoje",
      "Ainda nós.",
      "Mais maduros, mais próximos, com muito mais história para contar."
    ],
    [
      "Próximo capítulo",
      "Ainda por escrever.",
      "E é precisamente isso que mais gosto: ainda temos tanta coisa para viver."
    ]
  ];

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

  $("#storyLine").addEventListener("click", e => {
    const b = e.target.closest("[data-chapter]");
    if (!b) return;

    const x = chapters[+b.dataset.chapter];

    openModal(
      "📖",
      x[1],
      `<p>${x[2]}</p>`
    );

    once(
      `chapter-${b.dataset.chapter}`,
      1,
      "capítulo descoberto"
    );
  });


  // Memories carousel

  const memories = [
    [
      "14 · 02 · nós",
      "Uma fotografia. Uma quantidade absurda de sentimentos.",
      "Às vezes uma fotografia parece só uma fotografia. Mas esta faz-me lembrar como é bom poder olhar para o lado e encontrar-te.",
      "Quero encher a nossa história de momentos assim. Uns grandes, outros completamente simples. Desde que sejam contigo.",
      "img/memoria1.jpeg"
    ],

    [
      "nós · sem pressa",
      "Os momentos simples também contam.",
      "Não preciso que todos os nossos dias sejam extraordinários.",
      "Um sofá, comida qualquer, uma conversa parva e tu ao meu lado já são coisas que quero guardar.",
      "img/memoria2.jpeg"
    ],

    [
      "um dia · outra viagem",
      "Ainda quero descobrir muitos lugares contigo.",
      "Quero estradas, praias, miradouros e aquelas viagens em que nem sabemos bem a que horas vamos voltar.",
      "Quero poder olhar para ti no fim do dia e pensar: valeu a pena vir.",
      "img/memoria3.jpeg"
    ],

    [
      "capítulo · futuro",
      "Quero continuar a ter fotografias nossas.",
      "Mais datas, mais aventuras, mais dias completamente normais.",
      "Porque daqui a muitos anos quero olhar para trás e reconhecer uma vida cheia de pequenos momentos contigo.",
      "img/memoria4.jpeg"
    ]
  ];

  let mi = 0;

  function renderMemory() {
    const m = memories[mi];

    $("#memoryPill").textContent = m[0];
    $("#memoryTitle").textContent = m[1];
    $("#memoryP1").textContent = m[2];
    $("#memoryP2").textContent = m[3];
    $("#memoryImage").src = m[4];
    $("#memoryNumber").textContent =
      `0${mi + 1} / 0${memories.length}`;
  }

  $("#memoryPrev").onclick = () => {
    mi = (mi - 1 + memories.length) % memories.length;
    renderMemory();
  };

  $("#memoryNext").onclick = () => {
    mi = (mi + 1) % memories.length;
    renderMemory();
  };

  $("#memorySave").onclick = () => {
    openModal(
      "📸",
      "Memória guardada.",
      "<p>Mais uma pequena coisa nossa ficou guardada neste cantinho.</p>"
    );

    once(
      `memory-${mi}`,
      1,
      "memória guardada"
    );
  };


  // Room

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
      `<p>Se estivéssemos aqui agora, provavelmente estávamos abraçados, a ver qualquer coisa e a interromper o filme para dizer coisas parvas.</p>`
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
       <p>Gosto disso. Mas há uma surpresa maior escondida noutro sítio.</p>`
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


  // Secrets

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
      "Amo poder ser completamente parvo contigo e sentir-me em casa."
    ],
    [
      "🏠",
      "O que imagino",
      "Uma casa nossa. Uma vida nossa. Pequenas coisas que significam tudo."
    ],
    [
      "🫶",
      "Uma coisa que quero que saibas",
      "Não tens de merecer o meu carinho. Ele já é teu."
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


  // Garden

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
      "<p>Às vezes olho para ti e penso simplesmente: como é que tive tanta sorte?</p>"
    ],

    25: [
      "📸",
      "Uma memória nossa",
      `<img src="foto-dia-dos-namorados.jpeg" alt="Memória nossa" class="modal-photo">
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
      `<p>Esta não se lê. Esta vive-se. Há uma coisa que quero preparar para nós. 👀❤️</p>`
    ],

    100: [
      "❤️",
      "O nosso próximo date",
      `<p>Não vou contar tudo. Só quero que saibas que estou a preparar uma coisa bonita para nós.</p>`
    ],

    150: [
      "💍",
      "O maior segredo",
      `<p>Quando penso no futuro, vejo uma casa nossa, viagens, aventuras, uma família e muitos anos a escolher-te.</p>`
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

    const next = rewards.find(x => state.stars < x[0]);

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
    s.style.top = (20 + Math.random() * 65) + "%";
    s.style.animationDelay =
      (Math.random() * 6) * -1 + "s";
    fire.appendChild(s);
  }


  // Breathing

  let breathRun = 0;

  $("#breathStart").onclick = () => {
    if ($("#breathStart").disabled) return;

    const token = ++breathRun;
    const orb = $("#breathOrb");
    const word = $("#breathWord");
    const time = $("#breathTime");
    const line = $("#breathLine");
    const btn = $("#breathStart");
    const dots = $("#breathDots");

    const seq = [
      [
        "Inspira",
        "devagar",
        "in",
        "Só precisas de estar aqui.",
        4000
      ],
      [
        "Fica...",
        "mais um pouco",
        "in",
        "Muito devagar.",
        2000
      ],
      [
        "Solta",
        "tudo",
        "out",
        "Deixa o corpo ficar pesado.",
        5000
      ],
      [
        "Muito bem",
        "❤️",
        "out",
        "É só isto. Um momento de cada vez.",
        1200
      ]
    ];

    let step = 0;
    let cycle = 0;

    btn.disabled = true;

    dots.innerHTML =
      "<i></i><i></i><i></i>";

    const run = () => {
      if (token !== breathRun) return;

      const s = seq[step];

      word.textContent = s[0];
      time.textContent = s[1];
      line.textContent = s[3];
      orb.className = `breath-orb ${s[2]}`;

      setTimeout(() => {
        if (token !== breathRun) return;

        step++;

        if (step === seq.length) {
          step = 0;
          cycle++;

          if (dots.children[Math.min(cycle - 1, 2)]) {
            dots.children[Math.min(cycle - 1, 2)]
              .classList.add("done");
          }

          if (cycle >= 3) {
            word.textContent = "Conseguiste";
            time.textContent = "❤️";
            line.textContent =
              "Já passou mais uma vez. Podes ficar aqui o tempo que precisares.";

            orb.className = "breath-orb";
            btn.disabled = false;

            once(
              "breathing",
              3,
              "respiração concluída"
            );

            return;
          }
        }

        run();
      }, s[4]);
    };

    run();
  };


  // Constellation

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
      "A minha parte favorita da vida é poder dizer “nós”."
    ],
    [
      "✧",
      62,
      68,
      "Uma viagem",
      "Ainda quero ver muitos lugares contigo."
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
    b.setAttribute("aria-label", it[3]);

    b.onclick = () => {
      $$(".constellation-star")
        .forEach(x => x.classList.remove("found"));

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
    const lines = $(".constellation-lines");
    if (!lines) return;

    lines.innerHTML = "";

    const ss = $$(".constellation-star");

    for (let i = 0; i < ss.length - 1; i++) {
      const a = ss[i];
      const b = ss[i + 1];

      const x1 =
        a.offsetLeft + a.offsetWidth / 2;

      const y1 =
        a.offsetTop + a.offsetHeight / 2;

      const x2 =
        b.offsetLeft + b.offsetWidth / 2;

      const y2 =
        b.offsetTop + b.offsetHeight / 2;

      const dx = x2 - x1;
      const dy = y2 - y1;

      const len = Math.hypot(dx, dy);

      const l = document.createElement("i");

      l.className = "constellation-line";
      l.style.width = len + "px";
      l.style.left = x1 + "px";
      l.style.top = y1 + "px";
      l.style.transform =
        `rotate(${Math.atan2(dy, dx)}rad)`;

      lines.appendChild(l);
    }
  }

  window.addEventListener(
    "resize",
    drawConstellation
  );


  // Finale

  function checkFinal() {
    if (
      state.stars >= 75 ||
      Object.keys(state.seen).length >= 18
    ) {
      const nav = $$("[data-go='finale']");
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
  // TEMA + SPOTIFY
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


  // Spotify configuration

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

    const response = await fetch(
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

    const response = await fetch(
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


    // Depois do login, prepara o player.
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


        // PRIMEIRA VEZ:
        // manda para o login Spotify

        if (!token) {

          toast(
            "A ligar ao Spotify… 🎵"
          );

          await loginSpotify();

          return;
        }


        // Se ainda não existe player,
        // cria-o.

        if (!spotifyPlayer) {

          await initSpotifyPlayer();
        }


        // Ainda não temos dispositivo.

        if (
          !spotifyPlayer ||
          !spotifyDeviceId
        ) {

          toast(
            "O Spotify ainda está a preparar-se. Tenta novamente. 🎵"
          );

          return;
        }


        // Verificar estado atual

        const currentState =
          await spotifyPlayer.getCurrentState();


        // Se já está a tocar,
        // pausa.

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


        // Caso contrário,
        // começa a playlist.

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


  // Spotify SDK callback

  window.onSpotifyWebPlaybackSDKReady =
    () => {

      const token =
        localStorage.getItem(
          "spotify_access_token"
        );

      if (token) {
        initSpotifyPlayer()
          .catch(error =>
            console.error(
              "Spotify init error:",
              error
            )
          );
      }
    };


  // Verificar se voltámos do Spotify

  handleSpotifyCallback();


  // =========================================================
  // PARALLAX
  // =========================================================

  const hero = $("#heroScene");

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
  // START
  // =========================================================

  applyTheme();
  renderMemory();
  updateUI();
  checkFinal();

  requestAnimationFrame(
    drawConstellation
  );

})();