(function () {
  "use strict";

  var reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pointerFino = window.matchMedia("(pointer: fine)").matches;

  /* ============================================================
     TEMA CLARO/ESCURO
     ============================================================ */
  var botaoTema = document.getElementById("botao-tema");
  var root = document.documentElement;

  function aplicarTema(tema) {
    if (tema === "escuro") {
      root.setAttribute("data-tema", "escuro");
    } else {
      root.removeAttribute("data-tema");
    }
  }

  aplicarTema(localStorage.getItem("vyctor-tema") || "claro");

  botaoTema.addEventListener("click", function () {
    var atual = root.getAttribute("data-tema") === "escuro" ? "escuro" : "claro";
    var proximo = atual === "escuro" ? "claro" : "escuro";
    localStorage.setItem("vyctor-tema", proximo);
    aplicarTema(proximo);
  });

  /* ============================================================
     RELÓGIO LOCAL (São Paulo)
     ============================================================ */
  var relogio = document.getElementById("relogio");

  function atualizarRelogio() {
    try {
      var agora = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date());
      relogio.textContent = agora + " BRT";
    } catch (e) {
      relogio.textContent = "";
    }
  }

  atualizarRelogio();
  setInterval(atualizarRelogio, 30000);

  /* ============================================================
     MENU MOBILE
     ============================================================ */
  var botaoMenu = document.getElementById("botao-menu");
  var menu = document.getElementById("menu");

  botaoMenu.addEventListener("click", function () {
    var aberto = menu.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", aberto ? "true" : "false");
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("aberto");
      botaoMenu.setAttribute("aria-expanded", "false");
    });
  });

  /* ============================================================
     SCROLL: progresso + voltar ao topo
     ============================================================ */
  var progresso = document.getElementById("progresso");
  var aoTopo = document.getElementById("ao-topo");

  var naFila = false;

  function aoRolar() {
    if (naFila) return;
    naFila = true;

    requestAnimationFrame(function () {
      var ganho = window.scrollY;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      progresso.style.width = (total > 0 ? (ganho / total) * 100 : 0) + "%";

      if (ganho > 600) {
        aoTopo.style.opacity = "1";
        aoTopo.style.pointerEvents = "auto";
        aoTopo.style.borderColor = "var(--coral)";
      } else {
        aoTopo.style.opacity = "0";
        aoTopo.style.pointerEvents = "none";
      }

      naFila = false;
    });
  }

  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  aoTopo.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ============================================================
     SCROLLSPY — destaca seção ativa no menu
     ============================================================ */
  if ("IntersectionObserver" in window) {
    var secoes = document.querySelectorAll("main section[id]");
    var linksMenu = menu.querySelectorAll("a[href^='#']");

    var observadorSecao = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          linksMenu.forEach(function (link) {
            var ativo = link.getAttribute("href") === "#" + entrada.target.id;
            link.classList.toggle("ativo", ativo);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    secoes.forEach(function (secao) {
      observadorSecao.observe(secao);
    });
  }

  /* ============================================================
     REVEAL NA ROLAGEM
     ============================================================ */
  var reveles = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var observadorRevele = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visivel");
            observadorRevele.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    reveles.forEach(function (el) {
      observadorRevele.observe(el);
    });
  } else {
    reveles.forEach(function (el) {
      el.classList.add("visivel");
    });
  }

  /* ============================================================
     EFEITO DE DIGITAÇÃO NO TERMINAL
     ============================================================ */
  var destino = document.getElementById("linha-digitasse");
  var frases = [
    "node server.js — online em 42ms",
    "npm run dev — tudo no lugar",
    "git commit -m \"café > bug\"",
    "python main.py — tarefa concluída"
  ];
  var indiceFrase = 0;
  var temporizador = null;

  function digitar(passo) {
    var frase = frases[indiceFrase];
    if (passo <= frase.length) {
      destino.textContent = frase.slice(0, passo);
      temporizador = setTimeout(function () {
        digitar(passo + 1);
      }, 45);
    } else {
      indiceFrase = (indiceFrase + 1) % frases.length;
      temporizador = setTimeout(function () {
        destino.textContent = "";
        digitar(0);
      }, 2800);
    }
  }

  if (!reduzMovimento) {
    setTimeout(function () {
      digitar(0);
    }, 900);
  } else {
    destino.textContent = frases[0];
  }

  /* ============================================================
     MAGNETISMO NOS BOTÕES
     ============================================================ */
  function magnetico(elemento) {
    var forca = 0.25;

    elemento.addEventListener("mousemove", function (e) {
      if (reduzMovimento) return;
      var r = elemento.getBoundingClientRect();
      var mx = e.clientX - r.left - r.width / 2;
      var my = e.clientY - r.top - r.height / 2;
      elemento.style.transform = "translate(" + mx * forca + "px, " + my * forca + "px)";
    });

    elemento.addEventListener("mouseleave", function () {
      elemento.style.transform = "";
    });
  }

  if (pointerFino && !reduzMovimento) {
    document.querySelectorAll("[data-magnet]").forEach(magnetico);
  }

  /* ============================================================
     TILT 3D NO TERMINAL
     ============================================================ */
  var terminal = document.getElementById("terminal");

  function tiltEvt(e) {
    if (reduzMovimento) return;

    var r = terminal.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width - 0.5;
    var py = (e.clientY - r.top) / r.height - 0.5;

    terminal.style.transform =
      "rotateY(" + px * 8 + "deg) rotateX(" + -py * 8 + "deg) translateZ(10px)";
  }

  function tiltSai() {
    terminal.style.transform = "";
  }

  if (pointerFino && !reduzMovimento) {
    terminal.addEventListener("mousemove", tiltEvt);
    terminal.addEventListener("mouseleave", tiltSai);
  }

  /* ============================================================
     CURSOR CUSTOM
     ============================================================ */
  var dot = document.querySelector(".cursor-dot");
  var ring = document.querySelector(".cursor-ring");

  if (pointerFino && !reduzMovimento && window.history && dot && ring) {
    document.body.classList.add("cursor-ativo");

    var posX = -100;
    var posY = -100;
    var ringX = -100;
    var ringY = -100;
    var emVoo = false;

    document.addEventListener("mousemove", function (e) {
      posX = e.clientX;
      posY = e.clientY;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
      if (!emVoo) {
        ringX = posX;
        ringY = posY;
        emVoo = true;
        loopCursor();
      }
    });

    document.addEventListener("mouseleave", function () {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
      emVoo = false;
    });

    document.addEventListener(
      "mouseover",
      function (e) {
        var interativo = e.target.closest("a, button, input, textarea, .cartao, .skill-hit, label");
        document.body.classList.toggle("cursor-voraz", !!interativo);
      }
    );

    function loopCursor() {
      dot.style.left = posX + "px";
      dot.style.top = posY + "px";

      ringX += (posX - ringX) * 0.18;
      ringY += (posY - ringY) * 0.18;
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";

      if (emVoo) requestAnimationFrame(loopCursor);
    }
  }

  /* ============================================================
     FORMULÁRIO — monta e-mail (mailto)
     ============================================================ */
  var formulario = document.getElementById("formulario");
  var statusForm = document.getElementById("form-status");

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var nome = document.getElementById("f-nome").value.trim();
    var email = document.getElementById("f-email").value.trim();
    var msg = document.getElementById("f-msg").value.trim();

    statusForm.classList.remove("erro");

    if (!nome || !email || !msg) {
      statusForm.textContent = "preenche nome, email e mensagem pra eu conseguir te responder :)";
      statusForm.classList.add("erro");
      return;
    }

    var assunto = encodeURIComponent("contato via portfólio — " + nome);
    var corpo = encodeURIComponent(msg + "\n\n— " + nome + " (" + email + ")");
    var alvo = "mailto:vyctor.bandeira@escola.pr.gov.br?subject=" + assunto + "&body=" + corpo;

    window.location.href = alvo;
    statusForm.textContent = "abrindo seu programa de email…";
  });
})();