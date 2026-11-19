/**
 * Datos de la invitación.
 * Cuando tengan fecha, lugar y WhatsApp, completa solo este objeto.
 *
 * fechaISO: "2026-12-12T15:30:00-05:00"
 * fechaTexto: "Sábado 12 de diciembre"
 * whatsapp: "573001112233"  (indicativo + número, sin + ni espacios)
 * maps: enlace de Google Maps, o deja vacío y usa direccion
 */
const EVENTO = {
  novio: "Fredy",
  novia: "Rocío",
  fechaISO: "",
  fechaTexto: "",
  ceremonia: {
    lugar: "",
    direccion: "",
    hora: "",
    maps: "",
  },
  recepcion: {
    lugar: "",
    direccion: "",
    hora: "",
    maps: "",
  },
  whatsapp: "",
  bautizos: [
    { nombre: "Gabriela", fechaTexto: "", hora: "", lugar: "", direccion: "", maps: "" },
    { nombre: "Valeria", fechaTexto: "", hora: "", lugar: "", direccion: "", maps: "" },
  ],
};

const $ = (sel, root = document) => root.querySelector(sel);

function textOf(value) {
  return typeof value === "string" ? value.trim() : "";
}

function mapsHref(block) {
  const direct = textOf(block.maps);
  if (direct) return direct;
  const query = [block.lugar, block.direccion].map(textOf).filter(Boolean).join(", ");
  if (!query) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function setOptional(el, value) {
  const clean = textOf(value);
  if (!el) return;
  if (!clean) {
    el.hidden = true;
    return;
  }
  el.hidden = false;
  el.textContent = clean;
}

function fillNames() {
  document.querySelectorAll("[data-novio]").forEach((el) => {
    el.textContent = EVENTO.novio;
  });
  document.querySelectorAll("[data-novia]").forEach((el) => {
    el.textContent = EVENTO.novia;
  });
  document.querySelectorAll("[data-pareja]").forEach((el) => {
    el.textContent = `${EVENTO.novio} & ${EVENTO.novia}`;
  });
  document.querySelectorAll("[data-inicial-novio]").forEach((el) => {
    el.textContent = EVENTO.novio.charAt(0).toUpperCase();
  });
  document.querySelectorAll("[data-inicial-novia]").forEach((el) => {
    el.textContent = EVENTO.novia.charAt(0).toUpperCase();
  });
  document.title = `${EVENTO.novio} & ${EVENTO.novia}`;
}

function fillPlace(sel, block) {
  const root = $(sel);
  if (!root) return false;
  const has = [block.lugar, block.direccion, block.hora].some((item) => textOf(item));
  $(".js-filled", root).hidden = !has;
  $(".js-empty", root).hidden = has;
  if (has) {
    setOptional($(".js-lugar", root), block.lugar);
    setOptional($(".js-dir", root), block.direccion);
    setOptional($(".js-hora", root), block.hora);
  }
  const link = $(".js-maps", root);
  const href = mapsHref(block);
  if (href) {
    link.hidden = false;
    link.href = href;
  } else {
    link.hidden = true;
    link.removeAttribute("href");
  }
  return Boolean(href);
}

function fillDate() {
  const iso = textOf(EVENTO.fechaISO);
  const label = textOf(EVENTO.fechaTexto);
  const pending = $("#fechaPendiente");
  const countdown = $("#countdown");
  const line = $("#fechaTexto");
  const agenda = $("#agendar");
  const target = iso ? new Date(iso) : null;
  const valid = target && !Number.isNaN(target.getTime());

  if (label) {
    line.hidden = false;
    line.textContent = label;
    $("#fechaTitulo").textContent = label;
    $("#fechaLede").hidden = true;
  }

  if (!valid) {
    countdown.hidden = true;
    pending.hidden = false;
    agenda.hidden = true;
    return;
  }

  pending.hidden = true;
  countdown.hidden = false;
  const place = [EVENTO.ceremonia.lugar, EVENTO.ceremonia.direccion].map(textOf).filter(Boolean).join(", ");
  const end = new Date(target.getTime() + 4 * 60 * 60 * 1000);
  const stamp = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Boda de ${EVENTO.novio} y ${EVENTO.novia}`,
    dates: `${stamp(target)}/${stamp(end)}`,
    details: "Invitación de boda",
  });
  if (place) params.set("location", place);
  agenda.hidden = false;
  agenda.href = `https://calendar.google.com/calendar/render?${params.toString()}`;

  const units = {
    d: $('[data-unit="d"]'),
    h: $('[data-unit="h"]'),
    m: $('[data-unit="m"]'),
    s: $('[data-unit="s"]'),
  };
  const tick = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    const totalSeconds = Math.floor(diff / 1000);
    units.d.textContent = String(Math.floor(totalSeconds / 86400));
    units.h.textContent = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0");
    units.m.textContent = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    units.s.textContent = String(totalSeconds % 60).padStart(2, "0");
  };
  tick();
  window.setInterval(tick, 1000);
}

function fillBaptisms() {
  document.querySelectorAll("[data-baptism]").forEach((card) => {
    const index = Number(card.getAttribute("data-baptism"));
    const data = EVENTO.bautizos[index];
    if (!data) return;
    $("[data-b-name]", card).textContent = data.nombre;
    const bits = [data.fechaTexto, data.hora, data.lugar, data.direccion].map(textOf).filter(Boolean);
    const box = $(".js-details", card);
    box.replaceChildren();
    const lines = bits.length ? bits : ["Muy pronto compartiremos la hora y el lugar."];
    lines.forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      box.append(p);
    });
    const link = $(".js-maps", card);
    const href = mapsHref(data);
    if (href) {
      link.hidden = false;
      link.href = href;
    } else {
      link.hidden = true;
    }
  });
}

let startMusic = () => {};

function setupMusic() {
  const audio = $("#musica");
  const button = $("#soundBtn");
  if (!audio || !button) return;
  audio.volume = 0.55;
  let wantsSound = true;

  const paint = () => {
    const silent = !wantsSound || audio.paused;
    button.classList.toggle("is-muted", silent);
    button.setAttribute("aria-pressed", String(!silent));
    button.setAttribute("aria-label", silent ? "Activar música" : "Silenciar música");
  };

  startMusic = () => {
    if (!wantsSound) return;
    const pending = audio.play();
    if (pending) pending.then(paint).catch(paint);
  };

  button.addEventListener("click", () => {
    wantsSound = !wantsSound;
    if (!wantsSound) audio.pause();
    else startMusic();
    paint();
  });

  startMusic();
  paint();
}

function bloomFlowers() {
  const layer = $("#floracion");
  if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  layer.replaceChildren();
  const roses = ["rosas-ramo.png", "rosas-trio.png"];
  for (let i = 0; i < 4; i += 1) {
    const bloom = document.createElement("img");
    bloom.className = "rose-burst";
    bloom.src = roses[i % roses.length];
    bloom.alt = "";
    const angle = (Math.PI / 2) * i + 0.4;
    const dist = 180 + i * 36;
    bloom.style.setProperty("--x", `${Math.cos(angle) * dist}px`);
    bloom.style.setProperty("--y", `${Math.sin(angle) * dist}px`);
    bloom.style.setProperty("--r", `${i % 2 === 0 ? -18 : 16}deg`);
    bloom.style.setProperty("--d", `${1.15 + i * 0.08}s`);
    layer.append(bloom);
  }
  for (let i = 0; i < 26; i += 1) {
    const petal = document.createElement("span");
    petal.className = i % 5 === 0 ? "petal gold" : "petal";
    const angle = Math.random() * Math.PI * 2;
    const dist = 90 + Math.random() * 320;
    petal.style.setProperty("--x", `${Math.cos(angle) * dist}px`);
    petal.style.setProperty("--y", `${Math.sin(angle) * dist - 30}px`);
    petal.style.setProperty("--r", `${Math.random() * 220 - 40}deg`);
    petal.style.setProperty("--d", `${0.9 + Math.random() * 0.7}s`);
    layer.append(petal);
  }
  window.setTimeout(() => layer.replaceChildren(), 2600);
}

function openGate() {
  const button = $("#openInvite");
  button.addEventListener("click", () => {
    if (document.body.classList.contains("is-opening")) return;
    startMusic();
    document.body.classList.add("is-opening");
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 720;
    window.setTimeout(() => {
      document.body.classList.add("is-open");
      bloomFlowers();
      const main = $("#invitacion");
      main.focus({ preventScroll: true });
    }, delay);
  });
}

function setupRsvp() {
  const dialog = $("#rsvp");
  const form = $("#rsvpForm");
  const error = $("#rsvpError");
  const fields = $("#rsvpFields");
  const thanks = $("#rsvpThanks");
  let choice = "";

  const reset = () => {
    form.reset();
    choice = "";
    form.querySelectorAll(".choice").forEach((button) => button.setAttribute("aria-pressed", "false"));
    error.hidden = true;
    fields.hidden = false;
    thanks.hidden = true;
    $("#rsvpTitle").hidden = false;
  };

  $("#openRsvp").addEventListener("click", () => {
    reset();
    dialog.showModal();
  });
  $("#closeRsvp").addEventListener("click", () => dialog.close());

  form.querySelectorAll(".choice").forEach((button) => {
    button.addEventListener("click", () => {
      choice = button.getAttribute("data-choice");
      form.querySelectorAll(".choice").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      error.hidden = true;
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!choice) {
      error.hidden = false;
      return;
    }
    const data = new FormData(form);
    const nombre = textOf(String(data.get("nombre") || ""));
    const evento = textOf(String(data.get("evento") || "la boda"));
    const personas = Math.max(1, Number(data.get("personas")) || 1);
    const pareja = `${EVENTO.novio} y ${EVENTO.novia}`;
    const mensaje = choice === "si"
      ? `Hola, soy ${nombre}. Confirmo mi asistencia a ${evento} de ${pareja}. Vamos ${personas} ${personas === 1 ? "persona" : "personas"}.`
      : `Hola, soy ${nombre}. No podré acompañarlos en ${evento} de ${pareja}.`;

    const phone = textOf(EVENTO.whatsapp).replace(/\D/g, "");
    $("#thanksMessage").value = mensaje;
    if (phone) {
      $("#thanksText").textContent = "Se abrió WhatsApp con tu confirmación. Solo falta enviar el mensaje.";
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`, "_blank", "noopener");
    } else {
      $("#thanksText").textContent = `Gracias, ${nombre}. Copia este mensaje y envíaselo a ${pareja} para confirmar.`;
    }
    fields.hidden = true;
    thanks.hidden = false;
    $("#rsvpTitle").hidden = true;
  });

  $("#copyMsg").addEventListener("click", async () => {
    const value = $("#thanksMessage").value;
    try {
      await navigator.clipboard.writeText(value);
      $("#copyMsg").textContent = "Mensaje copiado";
    } catch {
      $("#thanksMessage").focus();
      $("#thanksMessage").select();
    }
  });
}

function setupLightbox() {
  const dialog = $("#lightbox");
  const image = $("#lightImg");
  document.querySelectorAll("[data-full]").forEach((button) => {
    button.addEventListener("click", () => {
      image.src = button.getAttribute("data-full");
      image.alt = button.getAttribute("aria-label") || "Foto de Fredy y Rocío";
      dialog.showModal();
    });
  });
  $("#closeLight").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

setupMusic();
fillNames();
const ceremonyHasMap = fillPlace("#locCeremonia", EVENTO.ceremonia);
const receptionHasMap = fillPlace("#locRecepcion", EVENTO.recepcion);
$("#mapsNote").hidden = ceremonyHasMap || receptionHasMap;
fillDate();
fillBaptisms();
openGate();
setupRsvp();
setupLightbox();
