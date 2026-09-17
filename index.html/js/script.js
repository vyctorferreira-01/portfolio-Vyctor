(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- tema ---------- */
  var botaoTema = doc.getElementById("botao-tema");
  var nomeTema = "vyctor-tema";

  function aplicarTema(tema, salvar) {
    root.setAttribute("data-tema", tema);
    if (salvar) {
      try { localStorage.setItem(nomeTema, tema); } catch (e) {}
    }
    if (botaoTema) botaoTema.setAttribute("aria-label", tema === "escuro" ? "Alternar para tema claro" : "Alternar para tema escuro");
  }

  var temaInicial = "claro";
  try { temaInicial = localStorage.getItem(nomeTema) || "claro"; } catch (e) {}
  aplicarTema(temaInicial, false);

  if (botaoTema) {
    botaoTema.addEventListener("click", function () {
      var proximo = root.getAttribute("data-tema") === "escuro" ? "claro" : "escuro";
      aplicarTema(proximo, true);
    });
  }

  /* ---------- menu mobile ---------- */
  var botaoMenu = doc.getElementById("botao-menu");
  var menu = doc.getElementById("menu");

  function fecharMenu() {
    if (!menu) return;
    menu.classList.remove("aberto");
    if (botaoMenu) {
      botaoMenu.setAttribute("aria-expanded", "false");
      botaoMenu.setAttribute("aria-label", "Abrir menu");
    }
  }

  function alternarMenu() {
    var aberto = menu.classList.toggle("aberto");
    if (botaoMenu) {
      botaoMenu.setAttribute("aria-expanded", String(aberto));
      botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    }
  }

  if (botaoMenu && menu) {
    botaoMenu.addEventListener("click", alternarMenu);

    menu.addEventListener("click", function (ev) {
      if (ev.target.closest("a")) fecharMenu();
    });

    doc.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") fecharMenu();
    });

    doc.addEventListener("click", function (ev) {
      if (menu.classList.contains("aberto") && !menu.contains(ev.target) && !botaoMenu.contains(ev.target)) fecharMenu();
    });
  }

  /* ---------- revelar, encenação da capa e parallax ---------- */
  var capa = doc.querySelector(".capa");
  var revelaveis = doc.querySelectorAll(".reveal, .mascara, .anim-wipe, .anim-slide, .anim-slide-r, .anim-scale, .anim-flip, .anim-bounce, .anim-clip, .anim-carril, .anim-contador, .anim-linha");

  function preencherCapa() {
    if (!capa) return [];
    var alvos = capa.querySelectorAll(".capa-rotulo, .capa-titulo .mascara, .capa-sub, .capa-acoes .botao, .capa-stack li, .perfil, .ficha-li");
    if (!reduzido) return alvos;
    [].forEach.call(alvos, function (alvo) {
      alvo.style.setProperty("--d", "0s");
    });
    return alvos;
  }

  function revelarCapa() {
    var alvos = preencherCapa();
    if (!alvos.length) return;
    if (reduzido) {
      [].forEach.call(alvos, function (a) { a.classList.add("visivel"); });
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        [].forEach.call(alvos, function (a) { a.classList.add("visivel"); });
      });
    });
  }

  if ("IntersectionObserver" in window && !reduzido) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visivel");
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -7% 0px" });

    revelaveis.forEach(function (item) {
      if (!capa || !capa.contains(item)) observador.observe(item);
    });

    revelarCapa();
  } else {
    revelaveis.forEach(function (item) { item.classList.add("visivel"); });
    revelarCapa();
  }

  /* parallax sutil na foto */
  var capaLado = doc.querySelector(".capa-lado");
  if (capaLado && !reduzido && window.innerWidth > 820) {
    var parFrame = null;
    window.addEventListener("scroll", function () {
      if (parFrame) return;
      parFrame = requestAnimationFrame(function () {
        parFrame = null;
        var y = window.scrollY;
        if (y <= window.innerHeight) {
          capaLado.style.transform = "translate3d(0, " + Math.min(Math.round(y * 0.16), 150) + "px, 0)";
        } else {
          capaLado.style.transform = "";
        }
      });
    }, { passive: true });
  }

  /* ---------- barra e botão ao topo ---------- */
  var barra = doc.getElementById("barra");
  var aoTopo = doc.getElementById("ao-topo");
  var limiarTopo = 600;

  function aoRolar() {
    var y = window.scrollY;
    if (barra) barra.classList.toggle("rolada", y > 8);
    if (aoTopo) aoTopo.classList.toggle("visivel", y > limiarTopo);
  }

  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  if (aoTopo) {
    aoTopo.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduzido ? "auto" : "smooth" });
    });
  }

  /* ---------- scrollspy ---------- */
  var linksMenu = Array.prototype.slice.call(doc.querySelectorAll('.menu a[href^="#"]'));
  var secoes = linksMenu
    .map(function (link) { return doc.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  function definirAtivo(secao) {
    linksMenu.forEach(function (link) {
      link.classList.toggle("ativo", link.getAttribute("href") === "#" + secao.getAttribute("id"));
    });
  }

  if ("IntersectionObserver" in window && secoes.length) {
    var spy = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) definirAtivo(entrada.target);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    secoes.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- formulário ---------- */
  var form = doc.getElementById("formulario");
  var statusEl = doc.getElementById("form-status");
  var emailAtual = "vyctor.bandeira@escola.pr.gov.br";

  if (form) {
    var nome = doc.getElementById("f-nome");
    var email = doc.getElementById("f-email");
    var msg = doc.getElementById("f-msg");

    var regraEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function limparErros() {
      [nome, email, msg].forEach(function (campo) { if (campo) campo.classList.remove("campo-erro"); });
    }

    function marcarErro(campo) {
      if (campo) {
        campo.classList.add("campo-erro");
        setTimeout(function () { campo.classList.remove("campo-erro"); }, 600);
      }
      if (statusEl) {
        statusEl.classList.add("erro");
        statusEl.textContent = "Confere os campos marcados e tenta de novo.";
      }
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      limparErros();

      var valido = true;

      if (nome.value.trim().length < 2) { marcarErro(nome); valido = false; }
      if (!regraEmail.test(email.value.trim())) { marcarErro(email); valido = false; }
      if (msg.value.trim().length < 8) { marcarErro(msg); valido = false; }

      if (!valido) return;

      var assunto = "Contato pelo portfólio — " + nome.value.trim();
      var corpo = "Oi Vyctor,%0D%0A%0D%0A" + encodeURIComponent(msg.value.trim()) + "%0D%0A%0D%0A— " + encodeURIComponent(nome.value.trim()) + " (" + encodeURIComponent(email.value.trim()) + ")";
      var destino = "mailto:" + emailAtual + "?subject=" + encodeURIComponent(assunto) + "&body=" + corpo;

      if (statusEl) {
        statusEl.classList.remove("erro");
        statusEl.textContent = "Mensagem pronta — abrindo seu email para enviar.";
      }

      window.location.href = destino;
    });
  }

  /* ---------- terminal animado ---------- */
  var termAtivo = doc.getElementById("terminal-ativo");
  var termCorpo = doc.getElementById("term-corpo");
  var termLinhas = termCorpo ? termCorpo.querySelectorAll(".term-linha") : [];
  var termRodando = false;

  function animarTerminal() {
    if (termRodando || !termCorpo) return;
    termRodando = true;

    var cursor = termCorpo.querySelector(".term-cursor");
    var linhaIdx = 0;

    function proximaLinha() {
      if (linhaIdx >= termLinhas.length) {
        if (cursor) cursor.style.display = "none";
        return;
      }

      var linha = termLinhas[linhaIdx];
      var delay = parseInt(linha.getAttribute("data-delay") || "0", 10);
      var cmdEl = linha.querySelector(".term-cmd");
      var texto = cmdEl ? cmdEl.getAttribute("data-text") : null;

      /* esconde cursor de linhas anteriores */
      var cursors = termCorpo.querySelectorAll(".term-cursor");
      [].forEach.call(cursors, function (c, i) {
        if (i < linhaIdx) c.style.display = "none";
      });

      if (texto && cmdEl) {
        /* digita caractere por caractere */
        setTimeout(function () {
          linha.classList.add("visivel");
          var i = 0;
          var intervalo = setInterval(function () {
            cmdEl.textContent = texto.substring(0, i + 1);
            i++;
            if (i >= texto.length) {
              clearInterval(intervalo);
              linhaIdx++;
              setTimeout(proximaLinha, 300);
            }
          }, 55);
        }, delay);
      } else {
        /* linha de saída — aparece de uma vez */
        setTimeout(function () {
          linha.classList.add("visivel");
          linhaIdx++;
          proximaLinha();
        }, delay);
      }
    }

    proximaLinha();
  }

  if ("IntersectionObserver" in window && termAtivo && !reduzido) {
    var termObs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          animarTerminal();
          termObs.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.3 });
    termObs.observe(termAtivo);
  } else if (termAtivo) {
    /* sem JS ou reduced-motion: mostra tudo */
    [].forEach.call(termLinhas, function (l) { l.classList.add("visivel"); });
    var c = termCorpo.querySelector(".term-cursor");
    if (c) c.style.display = "none";
  }

  /* ---------- radar card — relógio ---------- */
  var statusHora = doc.getElementById("status-hora");
  var statusValor = doc.getElementById("status-valor");

  function atualizarRelogio() {
    if (!statusHora) return;
    var agora = new Date();
    var h = String(agora.getHours()).padStart(2, "0");
    var m = String(agora.getMinutes()).padStart(2, "0");
    statusHora.textContent = h + ":" + m;
  }

  if (statusHora) {
    atualizarRelogio();
    setInterval(atualizarRelogio, 10000);
  }

  /* muda status entre "disponível" / "online" / "ativo" / "pronto" */
  var statusTextos = ["disponível", "online", "ativo", "pronto"];
  var statusIdx = 0;

  if (statusValor) {
    setInterval(function () {
      statusIdx = (statusIdx + 1) % statusTextos.length;
      statusValor.style.opacity = "0";
      setTimeout(function () {
        statusValor.textContent = statusTextos[statusIdx];
        statusValor.style.opacity = "";
      }, 200);
    }, 5000);
  }

  /* ---------- preloader ---------- */
  var preloader = doc.getElementById("preloader");
  if (preloader) {
    setTimeout(function () {
      preloader.classList.add("escondido");
      setTimeout(function () { preloader.remove(); }, 700);
    }, 2000);
  }

  /* ---------- ripple nos botões ---------- */
  doc.addEventListener("click", function (e) {
    var botao = e.target.closest(".botao");
    if (!botao || reduzido) return;

    var rect = botao.getBoundingClientRect();
    var ripple = doc.createElement("span");
    ripple.className = "botao-ripple";
    var tamanho = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = tamanho + "px";
    ripple.style.left = (e.clientX - rect.left - tamanho / 2) + "px";
    ripple.style.top = (e.clientY - rect.top - tamanho / 2) + "px";
    botao.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 650);
  });

  /* ---------- botão sucesso no form ---------- */
  if (form) {
    var botaoEnviar = form.querySelector(".botao");
    var originalTexto = botaoEnviar ? botaoEnviar.textContent : "";

    form.addEventListener("submit", function () {
      if (!botaoEnviar) return;
      botaoEnviar.textContent = "Enviado";
      botaoEnviar.classList.add("botao-sucesso");
      setTimeout(function () {
        botaoEnviar.textContent = originalTexto;
        botaoEnviar.classList.remove("botao-sucesso");
      }, 2500);
    });
  }

  /* ---------- marquee parallax ---------- */
  var marqueeFaixa = doc.querySelector(".marquee-faixa");
  if (marqueeFaixa && !reduzido) {
    var marqueeFrame = null;
    window.addEventListener("scroll", function () {
      if (marqueeFrame) return;
      marqueeFrame = requestAnimationFrame(function () {
        marqueeFrame = null;
        var marquee = doc.querySelector(".marquee");
        if (!marquee) return;
        var rect = marquee.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.top < vh && rect.bottom > 0) {
          var progresso = (vh - rect.top) / (vh + rect.height);
          var offset = (progresso - 0.5) * 40;
          marqueeFaixa.style.transform = "translateX(calc(-50% + " + offset + "px))";
        }
      });
    }, { passive: true });
  }

  /* ---------- tilt cards (skill panels) ---------- */
  if (!reduzido && window.matchMedia("(pointer: fine)").matches) {
    var paineis = doc.querySelectorAll(".skill-panel, .skill-radar");
    [].forEach.call(paineis, function (painel) {
      painel.addEventListener("mousemove", function (e) {
        var rect = painel.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var rotX = ((y - cy) / cy) * -6;
        var rotY = ((x - cx) / cx) * 6;
        painel.style.transform = "perspective(800px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg) translateY(-6px)";
      });
      painel.addEventListener("mouseleave", function () {
        painel.style.transform = "";
      });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (!reduzido && window.matchMedia("(pointer: fine)").matches) {
    var magneticos = doc.querySelectorAll(".botao.mag");
    [].forEach.call(magneticos, function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + (x * 0.25) + "px, " + (y * 0.25) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- counter animation ---------- */
  function animarContadores() {
    var contadores = doc.querySelectorAll(".secao-num");
    [].forEach.call(contadores, function (el) {
      var alvo = el.textContent.trim();
      if (!/^\d+$/.test(alvo)) return;
      var num = parseInt(alvo, 10);
      var atual = 0;
      var passo = Math.max(1, Math.floor(num / 15));
      var intervalo = setInterval(function () {
        atual += passo;
        if (atual >= num) {
          atual = num;
          clearInterval(intervalo);
        }
        el.textContent = String(atual).padStart(2, "0");
      }, 40);
    });
  }

  if ("IntersectionObserver" in window && !reduzido) {
    var counterObs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          animarContadores();
          counterObs.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.3 });
    var primeiraSecao = doc.querySelector(".secao");
    if (primeiraSecao) counterObs.observe(primeiraSecao);
  }

  /* ---------- split text reveal ---------- */
  var capaTitulo = doc.querySelector(".capa-titulo");
  if (capaTitulo && !reduzido) {
    var linhas = capaTitulo.querySelectorAll(".linha .mascara > span");
    [].forEach.call(linhas, function (span) {
      var texto = span.textContent;
      span.textContent = "";
      [].forEach.call(texto, function (ch, i) {
        var letra = doc.createElement("span");
        letra.textContent = ch === " " ? "\u00A0" : ch;
        letra.style.display = "inline-block";
        letra.style.opacity = "0";
        letra.style.transform = "translateY(20px) rotate(3deg)";
        letra.style.transition = "opacity 0.4s ease " + (i * 0.04) + "s, transform 0.5s var(--ease-bote) " + (i * 0.04) + "s";
        span.appendChild(letra);
      });
    });

    /* dispara depois do preloader */
    setTimeout(function () {
      var letras = capaTitulo.querySelectorAll(".mascara > span span");
      [].forEach.call(letras, function (l) {
        l.style.opacity = "1";
        l.style.transform = "translateY(0) rotate(0deg)";
      });
    }, 2200);
  }

  /* ---------- scroll progress ---------- */
  var scrollBar = doc.getElementById("scrollProgress");
  if (scrollBar) {
    window.addEventListener("scroll", function () {
      var scrollTop = window.scrollY;
      var docHeight = doc.documentElement.scrollHeight - window.innerHeight;
      var progresso = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollBar.style.width = progresso + "%";
    }, { passive: true });
  }

  /* ---------- glassmorphism nav ---------- */
  var barra = doc.getElementById("barra");
  if (barra) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 60) {
        barra.classList.add("deslizando");
      } else {
        barra.classList.remove("deslizando");
      }
    }, { passive: true });
  }

  /* ---------- text scramble ---------- */
  var chars = "!<>-_\\/[]{}—=+*^?#________";
  function scramble(el) {
    var original = el.getAttribute("data-original") || el.textContent;
    el.setAttribute("data-original", original);
    var frames = 0;
    var totalFrames = 8;
    var intervalo = setInterval(function () {
      el.textContent = original.split("").map(function (ch, i) {
        if (i < frames) return original[i];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join("");
      frames++;
      if (frames > totalFrames) {
        clearInterval(intervalo);
        el.textContent = original;
      }
    }, 30);
  }

  var botoesScramble = doc.querySelectorAll(".botao.mag");
  [].forEach.call(botoesScramble, function (btn) {
    btn.addEventListener("mouseenter", function () { scramble(btn); });
  });

  /* ---------- copy email com toast ---------- */
  var emailLink = doc.querySelector(".email-grande");
  var toast = doc.getElementById("toast");
  if (emailLink && toast) {
    emailLink.addEventListener("click", function (e) {
      e.preventDefault();
      var endereco = emailLink.getAttribute("data-email") || "vyctor.bandeira@escola.pr.gov.br";
      if (navigator.clipboard) {
        navigator.clipboard.writeText(endereco);
      }
      toast.classList.add("ativo");
      setTimeout(function () { toast.classList.remove("ativo"); }, 2000);
    });
  }

  /* ---------- scroll to top ---------- */
  var btnTopo = doc.getElementById("aoTopo");
  if (btnTopo) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 400) {
        btnTopo.classList.add("visivel");
      } else {
        btnTopo.classList.remove("visivel");
      }
    }, { passive: true });
    btnTopo.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- easter egg (3 cliques no logo) ---------- */
  var logo = doc.querySelector(".barra-logo");
  var egg = doc.getElementById("easterEgg");
  var cliqueCount = 0;
  var cliqueTimer = null;

  if (logo && egg) {
    logo.addEventListener("click", function () {
      cliqueCount++;
      clearTimeout(cliqueTimer);
      if (cliqueCount >= 3) {
        egg.classList.add("ativo");
        cliqueCount = 0;
        setTimeout(function () { egg.classList.remove("ativo"); }, 4000);
      }
      cliqueTimer = setTimeout(function () { cliqueCount = 0; }, 800);
    });
    egg.addEventListener("click", function () {
      egg.classList.remove("ativo");
    });
  }
})();