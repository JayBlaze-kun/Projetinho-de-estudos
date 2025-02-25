import { Gemini } from './api.js';

// Inicializar o acordeão quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new Accordion('.accordion-container', {
        openOnInit: [], // Nenhum painel aberto inicialmente
        oneOpen: false, // Permite múltiplos painéis abertos
        showMultiple: true, // Habilita abertura múltipla
        duration: 300 // Duração da animação em ms
    });

    // Inicializa o Splitting
    Splitting();
});


// Função para enviar foto
function enviarFoto() {
    const input = document.getElementById('fileInput');
    input.click();
    input.onchange = () => {
        if (input.files.length > 0) {
            processarFoto(input.files[0]);
        }
    };
}

// Função para enviar print do clipboard
async function enviarPrint() {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
                if (type.startsWith('image/')) {
                    const blob = await clipboardItem.getType(type);
                    processarFoto(new File([blob], "print.png", { type: type }));
                    return;
                }
            }
        }
        alert("Nenhuma imagem encontrada na área de transferência.");
    } catch (erro) {
        console.error("Erro ao acessar a área de transferência:", erro);
        alert("Não foi possível acessar a área de transferência. Por favor, verifique as permissões.");
    }
}

// Função para atualizar o status do progresso
function updateProgress(message) {
    const progressStatus = document.getElementById('progress-status');
    progressStatus.textContent = message;
}

// Função para mostrar o indicador de loading
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    updateProgress('Iniciando análise da imagem...');
}

// Função para esconder o indicador de loading
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('progress-status').textContent = '';
}

// Função para desabilitar os botões
function disableButtons() {
    const buttons = ['tirarFoto', 'enviarFoto', 'enviarPrint'].forEach(id => {
        const button = document.getElementById(id);
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
    });
}

// Função para reabilitar os botões
function enableButtons() {
    const buttons = ['tirarFoto', 'enviarFoto', 'enviarPrint'].forEach(id => {
        const button = document.getElementById(id);
        button.disabled = false;
        button.style.opacity = '';
        button.style.cursor = '';
    });
}

async function processarFoto(imageFile) {
    try {
        disableButtons(); // Desabilita os botões
        showLoading();
        
        // Sequência de mensagens durante o processamento
        setTimeout(() => updateProgress('Analisando o conteúdo da imagem...'), 1000);
        setTimeout(() => updateProgress('Identificando o tema da questão...'), 2500);
        setTimeout(() => updateProgress('Preparando os links de estudo...'), 4000);
        setTimeout(() => updateProgress('Montando a aula personalizada...'), 5500);
        
        const resultado = await Gemini(imageFile);
        
        updateProgress('Finalizando...');
        setTimeout(() => {
            hideLoading();
            exibirResultados(resultado);
            enableButtons(); // Reabilita os botões após sucesso
        }, 500);
        
    } catch (erro) {
        updateProgress('Erro ao processar a imagem');
        console.error("Erro ao processar a foto:", erro);
        alert("Ocorreu um erro ao processar a imagem. Por favor, tente novamente.");
        hideLoading();
        enableButtons(); // Reabilita os botões em caso de erro
    }
}

// Função para ocultar os botões de entrada
function hideInputButtons() {
    ['tirarFoto', 'enviarFoto', 'enviarPrint'].forEach(id => {
        const button = document.getElementById(id);
        button.style.display = 'none';
    });
    // Mostra o botão "Outra Questão"
    document.getElementById('outraQuestao').style.display = 'inline-block';
}

// Função para mostrar os botões de entrada
function showInputButtons() {
    // Verifica se é dispositivo móvel para mostrar botão apropriado
    if (isMobileDevice()) {
        document.getElementById('tirarFoto').style.display = 'inline-block';
        document.getElementById('enviarFoto').style.display = 'inline-block';
        document.getElementById('enviarPrint').style.display = 'none';
    } else {
        document.getElementById('tirarFoto').style.display = 'none';
        document.getElementById('enviarFoto').style.display = 'inline-block';
        document.getElementById('enviarPrint').style.display = 'inline-block';
    }
    // Oculta o botão "Outra Questão"
    document.getElementById('outraQuestao').style.display = 'none';
}

// Função para gerar prévia do conteúdo
function gerarPrevia(texto, tamanho = 150) {
    // Primeiro converte o markdown para HTML
    const htmlContent = marked.parse(texto);
    
    // Remove todas as tags HTML mantendo o texto formatado
    const textoLimpo = htmlContent
        .replace(/<[^>]*>/g, ' ') // Remove tags HTML
        .replace(/\s+/g, ' ')     // Remove espaços extras
        .replace(/&nbsp;/g, ' ')  // Substitui &nbsp; por espaço
        .replace(/&[a-z]+;/g, '') // Remove outros caracteres HTML especiais
        .trim();                  // Remove espaços no início e fim

    // Limita o tamanho e adiciona reticências se necessário
    const previa = textoLimpo.length > tamanho 
        ? textoLimpo.substring(0, tamanho) + '...'
        : textoLimpo;

    return previa;
}

// Atualizar a função exibirResultados
function exibirResultados(resultado) {
    const linksContent = document.getElementById('linksContent');
    const aulaContent = document.getElementById('aulaContent');
    const linksPreview = document.getElementById('linksPreview');
    const aulaPreview = document.getElementById('aulaPreview');

    const parsedLinks = marked.parse(resultado.links);
    const parsedAula = marked.parse(resultado.aula);

    function limparEstilos(html) {
        return html.replace(/style="[^"]*"/g, '')
                   .replace(/class="[^"]*"/g, '')
                   .replace(/<a /g, '<a target="_blank" ');
    }

    // Atualiza o conteúdo principal
    linksContent.innerHTML = limparEstilos(parsedLinks);
    aulaContent.innerHTML = limparEstilos(parsedAula);

    // Atualiza as prévias
    linksPreview.textContent = gerarPrevia(resultado.links);
    aulaPreview.textContent = gerarPrevia(resultado.aula);

    // Oculta os botões de entrada e mostra o botão "Outra Questão"
    hideInputButtons();

    // Forçar a aplicação dos estilos escuros
    document.querySelectorAll('.ac-panel *').forEach(el => {
        el.style.backgroundColor = 'var(--secondary-bg)';
        el.style.color = 'var(--text-color)';
    });
}

// Atualizar a função outraQuestao
function outraQuestao() {
    // Limpar cache e cookies
    if (window.caches) {
        caches.keys().then(function(names) {
            for (let name of names)
                caches.delete(name);
        });
    }
    
    // Limpar localStorage e sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Fechar os accordeons
    document.querySelectorAll('.ac').forEach(accordion => {
        accordion.classList.remove('is-active');
    });
    
    // Limpar os conteúdos
    document.getElementById('linksContent').innerHTML = '';
    document.getElementById('aulaContent').innerHTML = '';
    
    // Mostrar os botões de entrada novamente
    showInputButtons();
    
    // Forçar atualização da altura do fundo
    setTimeout(() => {
        const height = Math.max(
            document.documentElement.clientHeight,
            window.innerHeight || 0
        );
        vantaEffect.setOptions({ minHeight: height });
        vantaEffect.resize();
    }, 300);
}

// Adicionar event listeners aos botões
document.addEventListener('DOMContentLoaded', () => {
    const tirarFotoBtn = document.getElementById('tirarFoto');
    const enviarPrintBtn = document.getElementById('enviarPrint');

    if (isMobileDevice()) {
        tirarFotoBtn.style.display = 'inline-block';
        enviarPrintBtn.style.display = 'none';
    } else {
        tirarFotoBtn.style.display = 'none';
        enviarPrintBtn.style.display = 'inline-block';
    }

    tirarFotoBtn.addEventListener('click', tirarFoto);
    document.getElementById('enviarFoto').addEventListener('click', enviarFoto);
    enviarPrintBtn.addEventListener('click', enviarPrint);
    document.getElementById('outraQuestao').addEventListener('click', outraQuestao);

    // Adicionar listener para atualizar altura quando accordeons são fechados
    document.querySelectorAll('.ac-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            setTimeout(() => {
                const height = Math.max(
                    document.documentElement.clientHeight,
                    window.innerHeight || 0
                );
                vantaEffect.setOptions({ minHeight: height });
                vantaEffect.resize();
            }, 300);
        });
    });
});

// Inicializar o marked
marked.use({
    breaks: true,
    gfm: true
});

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}


function tirarFoto() {
    // Criar elementos HTML
    const cameraContainer = document.createElement('div');
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const captureBtn = document.createElement('button');
    const closeBtn = document.createElement('button');

    // Configurar estilos
    cameraContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    `;
    video.style.cssText = `
        width: 90%;
        max-height: 70vh;
        object-fit: cover;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    `;
    canvas.style.display = 'none';
    
    const buttonStyle = `
        width: 50px;
        height: 50px;
        font-size: 24px;
        font-weight: bold;
        color: #fff;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        transition: background-color 0.3s ease;
        outline: none;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 10px;
    `;
    
    captureBtn.innerHTML = '&#10004;'; // Símbolo de check
    captureBtn.style.cssText = `
        ${buttonStyle}
        background-color: #28a745;
    `;
    captureBtn.onmouseover = () => captureBtn.style.backgroundColor = '#218838';
    captureBtn.onmouseout = () => captureBtn.style.backgroundColor = '#28a745';
    
    closeBtn.innerHTML = '&#10006;'; // Símbolo de X
    closeBtn.style.cssText = `
        ${buttonStyle}
        background-color: #dc3545;
    `;
    closeBtn.onmouseover = () => closeBtn.style.backgroundColor = '#c82333';
    closeBtn.onmouseout = () => closeBtn.style.backgroundColor = '#dc3545';

    // Criar container para os botões
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        justify-content: center;
    `;
    buttonContainer.appendChild(closeBtn);
    buttonContainer.appendChild(captureBtn);

    // Adicionar elementos ao DOM
    cameraContainer.appendChild(video);
    cameraContainer.appendChild(canvas);
    cameraContainer.appendChild(buttonContainer);
    document.body.appendChild(cameraContainer);

    // Acessar a câmera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            video.srcObject = stream;
            video.play();
        })
        .catch(error => {
            console.error('Erro ao acessar a câmera:', error);
            alert('Não foi possível acessar a câmera.');
            cameraContainer.remove();
        });

    // Função para capturar a foto
    function capturarFoto() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        
        fecharCamera();
        
        // Converter o Data URL para um Blob
        fetch(imageDataUrl)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "foto.jpg", { type: "image/jpeg" });
                processarFoto(file);
            });
    }

    // Função para fechar a câmera
    function fecharCamera() {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        cameraContainer.remove();
        const capturedImage = document.querySelector('img[style*="position: fixed"]');
        if (capturedImage) {
            capturedImage.remove();
        }
    }

    // Adicionar event listeners
    captureBtn.addEventListener('click', capturarFoto);
    closeBtn.addEventListener('click', fecharCamera);
}