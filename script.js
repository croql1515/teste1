// Os dados dos cursos ficam em data.js (courseData)

// Estado reativo interno da aplicação
let userState = {
    watchedLessons: [], 
    lessonNotes: {},     
    currentLesson: null  
};

const CREDENCIAIS_VALIDAS = {
    usuario: "admin",
    senha: "1234"
};

// ==========================================================================
// 1. INICIALIZAÇÃO E GERENCIAMENTO DE ESTADO (LOCALSTORAGE)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    loadStateFromLocalStorage();
    setupEventListeners();
    checkLoginSession();
    setupSidebarNavigation();
    setupInstallSections();
    registerServiceWorker();
});

function loadStateFromLocalStorage() {
    const savedData = localStorage.getItem("blackboard_state");
    if (savedData) {
        userState = JSON.parse(savedData);
    }
}

function saveStateToLocalStorage() {
    localStorage.setItem("blackboard_state", JSON.stringify(userState));
    updateProgressUI();
}

// ==========================================================================
// 2. SISTEMA DE ROTAS/TELAS (LOGIN, HOME, AULA)
// ==========================================================================
function navigateTo(screenId) {
    const targetScreen = document.getElementById(screenId);
    
    // Se o usuário sair da tela de aula, limpamos o player para o vídeo parar
    if (screenId !== 'lesson-screen') {
        const player = document.getElementById('player');
        if (player) {
            player.innerHTML = `
                <div class="d-flex flex-column align-items-center justify-content-center text-white-50 h-100">
                    <i class="ri-play-circle-line display-2" aria-hidden="true"></i>
                    <p class="small mt-2">Player de Vídeo Educacional</p>
                </div>`;
        }
    }

    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('d-none');
        screen.classList.remove('d-block', 'd-flex');
    });

    if (screenId === 'login-screen') {
        targetScreen.classList.remove('d-none');
        targetScreen.classList.add('d-flex');
    } else {
        targetScreen.classList.remove('d-none');
        targetScreen.classList.add('d-block');
    }

    if (screenId === 'home-screen') {
        // CORREÇÃO: Quando entra na Home, apenas renderiza os módulos direto sem forçar d-none inicial
        renderModules();
        
        // Garante que a aba padrão (Cursos) esteja visível e as outras limpas/escondidas
        const coursesView = document.getElementById('sub-view-courses');
        if (coursesView) coursesView.classList.remove('d-none');
        
        document.getElementById('sub-view-download')?.classList.add('d-none');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function checkLoginSession() {
    const isLoggedIn = sessionStorage.getItem("user_logged");
    if (isLoggedIn) {
        navigateTo("home-screen");
    } else {
        navigateTo("login-screen");
    }
}

// ==========================================================================
// 3. CAPTURA E PROCESSAMENTO DE EVENTOS (INCLUINDO ANTERIOR/PRÓXIMA)
// ==========================================================================
function setupEventListeners() {
    
    function realizarLogin() {
        const usuarioInserido = document.getElementById("username").value.trim();
        const shadowPassword = document.getElementById("password").value;

        if (usuarioInserido === CREDENCIAIS_VALIDAS.usuario && shadowPassword === CREDENCIAIS_VALIDAS.senha) {
            sessionStorage.setItem("user_logged", "true");
            
            const loginCard = document.querySelector('#login-screen main');
            loginCard.style.transition = "transform 0.3s ease, opacity 0.3s ease";
            loginCard.style.transform = "scale(0.95)";
            loginCard.style.opacity = "0";

            setTimeout(() => {
                navigateTo("home-screen");
                loginCard.style.transform = "scale(1)";
                loginCard.style.opacity = "1";
                document.getElementById("username").value = "";
                document.getElementById("password").value = "";
            }, 300);

        } else {
            alert("⚠️ Usuário ou senha incorretos! Digite admin e 1234.");
        }
    }

    document.getElementById("btn-entrar-login").addEventListener("click", realizarLogin);

    document.getElementById("username").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            realizarLogin();
        }
    });
    document.getElementById("password").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            realizarLogin();
        }
    });

    document.getElementById("btn-confirm-logout").addEventListener("click", () => {
        sessionStorage.removeItem("user_logged");
        const modalElement = document.getElementById('logoutModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
        
        navigateTo("login-screen");
    });

    document.getElementById("btn-back-home").addEventListener("click", () => {
        navigateTo("home-screen");
    });

    document.getElementById("chk-watched").addEventListener("change", (e) => {
        if (!userState.currentLesson) return;
        const lessonId = userState.currentLesson.id;
        if (e.target.checked) {
            if (!userState.watchedLessons.includes(lessonId)) {
                userState.watchedLessons.push(lessonId);
            }
        } else {
            userState.watchedLessons = userState.watchedLessons.filter(id => id !== lessonId);
        }
        saveStateToLocalStorage();
    });

    document.getElementById("btn-next-lesson").addEventListener("click", () => {
        if (!userState.currentLesson) return;
        
        let currentModIndex = courseData.findIndex(m => m.lessons.some(l => l.id === userState.currentLesson.id));
        let currentLesIndex = courseData[currentModIndex].lessons.findIndex(l => l.id === userState.currentLesson.id);

        if (currentLesIndex < courseData[currentModIndex].lessons.length - 1) {
            openLesson(courseData[currentModIndex].id, courseData[currentModIndex].lessons[currentLesIndex + 1].id);
        }
    });

    document.getElementById("btn-prev-lesson").addEventListener("click", () => {
        if (!userState.currentLesson) return;

        let currentModIndex = courseData.findIndex(m => m.lessons.some(l => l.id === userState.currentLesson.id));
        let currentLesIndex = courseData[currentModIndex].lessons.findIndex(l => l.id === userState.currentLesson.id);

        if (currentLesIndex > 0) {
            openLesson(courseData[currentModIndex].id, courseData[currentModIndex].lessons[currentLesIndex - 1].id);
        }
    });

    document.getElementById("btn-hamburguer").addEventListener("click", () => {
        const hamburguer = document.getElementById("hamburguer");
        const logOff = document.getElementById("log-off");
        const isHidden = hamburguer.classList.contains("d-none");
        
        if (isHidden) {
            hamburguer.classList.remove("d-none");
            logOff.classList.remove("d-none");
        } else {
            hamburguer.classList.add("d-none");
            logOff.classList.add("d-none");
        }
    });

    const textarea = document.getElementById("lesson-notes");
    const statusNote = document.getElementById("notes-status");
    let typingTimer;

    textarea.addEventListener("input", () => {
        statusNote.innerHTML = "<i class='ri-loader-4-line ri-spin text-primary'></i> Salvando...";
        clearTimeout(typingTimer);
        
        typingTimer = setTimeout(() => {
            if (!userState.currentLesson) return;
            const lessonId = userState.currentLesson.id;
            userState.lessonNotes[lessonId] = textarea.value;
            saveStateToLocalStorage();
            statusNote.innerHTML = "<i class='ri-checkbox-circle-line text-success'></i> Todas as alterações salvas";
        }, 500);
    });
}

// ==========================================================================
// 4. ALTERNÂNCIA EXCLUSIVA DE SUB-VIEWS (ABAS DA SIDEBAR)
// ==========================================================================
function switchSubView(activeViewId) {
    ['sub-view-courses', 'sub-view-download'].forEach(viewId => {
        const el = document.getElementById(viewId);
        if (el) el.classList.toggle('d-none', viewId !== activeViewId);
    });
}

function setupSidebarNavigation() {
    const btnCursos = document.getElementById('nav-courses');
    const btnDownload = document.getElementById('nav-download');

    if (btnCursos) {
        btnCursos.addEventListener('click', (e) => {
            e.preventDefault();
            switchSubView('sub-view-courses');
            renderModules();
        });
    }

    if (btnDownload) {
        btnDownload.addEventListener('click', (e) => {
            e.preventDefault();
            switchSubView('sub-view-download');
        });
    }
}
// ==========================================================================
// 5. RENDERS DINÂMICOS NO FORMATO DE BARRAS HORIZONTAIS
// ==========================================================================
function renderModules() {
    const container = document.getElementById("modules-container");
    container.innerHTML = "";

    courseData.forEach((module, mIdx) => {
        const totalLessons = module.lessons.length;
        const watchedCount = module.lessons.filter(l => userState.watchedLessons.includes(l.id)).length;
        const progressPercent = totalLessons > 0 ? Math.round((watchedCount / totalLessons) * 100) : 0;

        let colorClass = mIdx % 2 === 0 ? 'bg-primary' : 'bg-warning';

        let lessonsHTML = "";
        module.lessons.forEach(lesson => {
            const isWatched = userState.watchedLessons.includes(lesson.id);
            const iconHTML = isWatched 
                ? `<i class="ri-checkbox-circle-fill text-success fs-5"></i>` 
                : `<i class="ri-checkbox-blank-circle-line text-muted fs-5"></i>`;
            
            lessonsHTML += `
                <button type="button" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-2 px-3 border-0 bg-light rounded mb-1" onclick="openLesson('${module.id}', '${lesson.id}')">
                    <div class="d-flex align-items-center gap-2 text-start text-truncate me-2">
                        ${iconHTML}
                        <div class="text-truncate">
                            <span class="small fw-medium text-dark text-truncate d-block">${lesson.title}</span>
                            <span class="text-muted d-block text-truncate" style="font-size: 0.72rem;">${lesson.videoUrl ? '<i class="ri-play-circle-line"></i>' : '<i class="ri-pencil-ruler-2-line"></i>'} ${lesson.duration || ''} · ${lesson.description || ''}</span>
                        </div>
                    </div>
                    <i class="ri-arrow-right-s-line text-muted flex-shrink-0"></i>
                </button>
            `;
        });

        const moduloRow = document.createElement("div");
        moduloRow.className = "card border-0 shadow-sm p-3 bg-white rounded-3 mb-2";
        moduloRow.innerHTML = `
            <div class="row align-items-center g-3">
                <div class="col-auto d-none d-sm-block">
                    <div class="${colorClass} rounded-pill" style="width: 6px; height: 45px;"></div>
                </div>
                <div class="col ps-sm-3">
                    <span class="text-muted text-uppercase fw-bold" style="font-size: 0.65rem;">Módulo 0${mIdx + 1}</span>
                    <h3 class="h6 fw-bold mb-1 text-dark">${module.title}</h3>
                    <p class="text-muted small mb-1">${module.description || ''}</p>
                    <p class="text-muted small mb-0">${watchedCount} de ${totalLessons} aulas concluídas</p>
                </div>
                <div class="col-12 col-md-4 col-lg-3">
                    <div class="d-flex align-items-center gap-3">
                        <div class="progress flex-grow-1" style="height: 6px;">
                            <div class="progress-bar ${colorClass}" style="width: ${progressPercent}%"></div>
                        </div>
                        <span class="small fw-bold text-secondary" style="font-size: 0.8rem;">${progressPercent}%</span>
                    </div>
                </div>
                <div class="col-12 col-md-auto text-end">
                    <button class="btn btn-light btn-sm text-primary fw-semibold w-100 w-md-auto px-3 py-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-mod-${mIdx}" aria-expanded="false">
                        Aulas <i class="ri-arrow-down-s-line"></i>
                    </button>
                </div>
            </div>
            <div class="collapse mt-3" id="collapse-mod-${mIdx}">
                <div class="list-group d-flex flex-column gap-1 pt-2 border-top border-light">
                    ${lessonsHTML}
                </div>
            </div>
        `;
        container.appendChild(moduloRow);
    });

    updateProgressUI();
}

function updateProgressUI() {
    let totalLessonsCount = 0;
    courseData.forEach(m => totalLessonsCount += m.lessons.length);
    
    const totalWatched = userState.watchedLessons.length;
    const globalPercent = totalLessonsCount > 0 ? Math.round((totalWatched / totalLessonsCount) * 100) : 0;

    const globalBar = document.getElementById("total-progress-bar");
    const globalText = document.getElementById("total-progress-text");
    
    if (globalBar && globalText) {
        globalBar.style.width = `${globalPercent}%`;
        globalText.innerText = `${globalPercent}% Concluído`;
    }
}

// ==========================================================================
// 6. ABERTURA DE AULA — PLAYER DINÂMICO USANDO IFRAME DO YOUTUBE
// ==========================================================================
function openLesson(moduleId, lessonId) {
    const currentMod = courseData.find(m => m.id === moduleId);
    const currentLes = currentMod.lessons.find(l => l.id === lessonId);

    userState.currentLesson = currentLes;

    document.getElementById("lesson-title").innerText = currentLes.title;
    document.getElementById("lesson-module").innerText = currentMod.title;
    document.getElementById("chk-watched").checked = userState.watchedLessons.includes(lessonId);
    document.getElementById("lesson-description").innerText = currentLes.description || "";
    document.getElementById("lesson-meta").innerHTML =
        `<i class="ri-time-line"></i> ${currentLes.duration || ""} · Aula ${currentMod.lessons.findIndex(l => l.id === lessonId) + 1} de ${currentMod.lessons.length}`;
    const practiceBox = document.getElementById("lesson-practice");
    if (currentLes.practice) {
        practiceBox.innerHTML = `<h2 class="h6 fw-bold mb-2"><i class="ri-list-check-2 text-primary"></i> Roteiro do exercício</h2>
            <ul class="practice-list mb-0 ps-3">${currentLes.practice.map(p => `<li>${p}</li>`).join("")}</ul>`;
        practiceBox.classList.remove("d-none");
    } else {
        practiceBox.classList.add("d-none");
    }

    const savedNotes = userState.lessonNotes[lessonId] || "";
    document.getElementById("lesson-notes").value = savedNotes;
    document.getElementById("notes-status").innerHTML = "<i class='ri-checkbox-circle-line text-success'></i> Todas as alterações salvas";

    const btnPrev = document.getElementById('btn-prev-lesson');
    const btnNext = document.getElementById('btn-next-lesson');
    const currentLesIndex = currentMod.lessons.findIndex(l => l.id === lessonId);

    if (currentLesIndex === 0) {
        btnPrev.setAttribute('disabled', 'true');
    } else {
        btnPrev.removeAttribute('disabled');
    }

    if (currentLesIndex === currentMod.lessons.length - 1) {
        btnNext.setAttribute('disabled', 'true');
    } else {
        btnNext.removeAttribute('disabled');
    }

    navigateTo("lesson-screen");

    const player = document.getElementById('player');
    const urlVideo = currentLes.videoUrl;

    if (!urlVideo) {
        player.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center text-white h-100 text-center px-3" style="min-height: 200px;">
                <i class="ri-pencil-ruler-2-line display-2" aria-hidden="true"></i>
                <p class="fw-semibold mt-2 mb-0">Aula prática</p>
                <p class="small text-white-50 mb-0">Siga o roteiro abaixo e marque como concluída.</p>
            </div>`;
    } else {
        player.innerHTML = `
            <iframe 
                src="${urlVideo}?autoplay=1&rel=0" 
                title="${currentLes.title}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen
                style="width:100%; height:100%; display:block; object-fit:contain;">
            </iframe>`;
    }
}

// ==========================================================================
// 7. PWA: INSTALAÇÃO (SEÇÃO "COMO INSTALAR"), QR CODE E SERVICE WORKER
// ==========================================================================
let deferredInstallPrompt = null;

function detectOS() {
    const ua = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
    if (/Android/i.test(ua)) return "android";
    return "desktop";
}

function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function setupInstallSections() {
    const tpl = document.getElementById("install-template");
    ["install-login", "install-home"].forEach((hostId) => {
        const host = document.getElementById(hostId);
        if (!host) return;
        host.innerHTML = tpl.innerHTML.replace(/__ID__/g, hostId);
        const root = host.querySelector(".install-section");

        const showOS = (os) => {
            root.querySelectorAll(".js-os-panel").forEach(p => p.classList.toggle("d-none", p.dataset.os !== os));
            root.querySelectorAll(".js-os-tabs .nav-link").forEach(b => {
                const active = b.dataset.os === os;
                b.classList.toggle("active", active);
                b.setAttribute("aria-selected", active);
            });
        };
        root.querySelectorAll(".js-os-tabs .nav-link").forEach(b => b.addEventListener("click", () => showOS(b.dataset.os)));
        showOS(detectOS());

        root.querySelector(".js-url").textContent = location.href.split("#")[0];
        const qr = root.querySelector(".js-qr");
        if (window.QRCode) {
            new QRCode(qr, { text: location.href.split("#")[0], width: 128, height: 128, correctLevel: QRCode.CorrectLevel.M });
        } else {
            qr.classList.add("d-none");
        }

        root.querySelector(".js-installed").classList.toggle("d-none", !isStandalone());
        root.querySelector(".js-install-btn").addEventListener("click", async () => {
            if (!deferredInstallPrompt) return;
            deferredInstallPrompt.prompt();
            await deferredInstallPrompt.userChoice;
            deferredInstallPrompt = null;
            updateInstallButtons();
        });
    });
}

function updateInstallButtons() {
    document.querySelectorAll(".js-install-now").forEach(el => el.classList.toggle("d-none", !deferredInstallPrompt));
}

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    updateInstallButtons();
});

window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallButtons();
    document.querySelectorAll(".js-installed").forEach(el => el.classList.remove("d-none"));
});

function registerServiceWorker() {
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
        navigator.serviceWorker.register("./sw.js").catch((err) => console.warn("SW não registrado:", err));
    }
}
