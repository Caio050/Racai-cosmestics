
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"; // Importe signOut

const firebaseConfig = {
    apiKey: "AIzaSyAh8-5VoJV-0HIG1aVLbdk8tm9CZrCBTfk",
    authDomain: "racai-variedades.firebaseapp.com",
    projectId: "racai-variedades",
    storageBucket: "racai-variedades.firebasestorage.app",
    messagingSenderId: "18722161117",
    appId: "1:18722161117:web:c845210bb372cf9e533634",
    measurementId: "G-NF1NHBG6JT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const produtosRef = collection(db, "produtos");

const container = document.getElementById("produtos-lista");
const produtosTitulo = document.getElementById('produtos-titulo');

let usuarioLogado = null;

// Referência ao link de login/logout na navegação
const loginLogoutLink = document.querySelector('nav a[href="login.html"]');

// **NOVA ADIÇÃO: Link para "Esqueci a Senha"**
const forgotPasswordLink = document.getElementById('forgot-password-link'); // Seleciona o novo ID

if (forgotPasswordLink) { // Verifica se o elemento existe antes de adicionar o listener
    forgotPasswordLink.addEventListener('click', async (e) => {
        e.preventDefault(); // Impede o comportamento padrão do link

        const email = prompt("Por favor, digite seu e-mail para redefinir a senha:");

        if (email) {
            try {
                await sendPasswordResetEmail(auth, email);
                alert("Um e-mail de redefinição de senha foi enviado para " + email + ". Por favor, verifique sua caixa de entrada.");
            } catch (error) {
                console.error("Erro ao enviar e-mail de redefinição de senha:", error.message);
                
                let errorMessage = "Ocorreu um erro ao enviar o e-mail de redefinição de senha. Por favor, tente novamente.";
                if (error.code === 'auth/invalid-email') {
                    errorMessage = "O endereço de e-mail fornecido é inválido.";
                } else if (error.code === 'auth/user-not-found') {
                    errorMessage = "Não há usuário registrado com este e-mail.";
                }
                alert(errorMessage);
            }
        } else {
            alert("Operação cancelada. Nenhum e-mail foi fornecido.");
        }
    });
}


// da sacola para o WHATSAPP
const sacolaPopup = document.getElementById('sacola-popup');
const fecharSacolaBtn = document.getElementById('fechar-sacola');
const itensSacolaDiv = document.getElementById('itens-sacola');
const valorTotalSacolaSpan = document.getElementById('valor-total-sacola');
const finalizarCompraBtn = document.getElementById('finalizar-compra-btn');
const carrinhoIcon = document.getElementById('carrinho-icon');
const contadorCarrinhoSpan = document.getElementById('contador-carrinho');

let sacola = [];

function salvarSacola() {
    localStorage.setItem('sacolaRaCai', JSON.stringify(sacola));
}

function carregarSacola() {
    const sacolaSalva = localStorage.getItem('sacolaRaCai');
    if (sacolaSalva) {
        sacola = JSON.parse(sacolaSalva);
        atualizarSacolaUI();
    }
}

function adicionarASacola(produto) {
    const itemExistente = sacola.find(item => item.id === produto.id);
    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        sacola.push({ ...produto, quantidade: 1 });
    }
    salvarSacola();
    atualizarSacolaUI();
}

function removerDaSacola(idProduto) {
    sacola = sacola.filter(item => item.id !== idProduto);
    salvarSacola();
    atualizarSacolaUI();
}

function atualizarSacolaUI() {
    itensSacolaDiv.innerHTML = '';
    let total = 0;

    if (sacola.length === 0) {
        itensSacolaDiv.innerHTML = '<p>Sua sacola está vazia.</p>';
        finalizarCompraBtn.disabled = true;
    } else {
        sacola.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('item-carrinho');
            itemElement.innerHTML = `
                <img src="${item.imagem}" alt="${item.nome}" width="60" height="60" style="object-fit: cover;">
                <div class="item-info">
                    <h4>${item.nome} (Qtd: ${item.quantidade})</h4>
                    <p>R$ ${(item.preco * item.quantidade).toFixed(2)}</p>
                </div>
                <button class="remover-item-btn" data-id="${item.id}">Remover</button>
            `;
            itensSacolaDiv.appendChild(itemElement);
            total += item.preco * item.quantidade;
        });
        finalizarCompraBtn.disabled = false;
    }

    valorTotalSacolaSpan.textContent = `R$ ${total.toFixed(2)}`;
    contadorCarrinhoSpan.textContent = sacola.length;

    document.querySelectorAll('.remover-item-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const idProduto = event.target.dataset.id;
            removerDaSacola(idProduto);
        });
    });
}

carrinhoIcon.addEventListener('click', (event) => {
    event.preventDefault();
    sacolaPopup.classList.add('ativo');
    atualizarSacolaUI();
});

fecharSacolaBtn.addEventListener('click', () => {
    sacolaPopup.classList.remove('ativo');
});

window.addEventListener('click', (event) => {
    if (event.target === sacolaPopup) {
        sacolaPopup.classList.remove('ativo');
    }
});

finalizarCompraBtn.addEventListener('click', () => {
    if (sacola.length === 0) {
        alert("Sua sacola está vazia! Adicione produtos antes de finalizar a compra.");
        return;
    }

    const nomeLoja = "RaCai Cosméticos";
    let mensagem = `Olá, ${nomeLoja}! Escolhi os seguintes produtos:\n\n`;
    let valorTotal = 0;

    const telefoneLoja = "5511937390141"; 

    sacola.forEach(item => {
        mensagem += `- ${item.nome} (Qtd: ${item.quantidade}) - R$ ${(item.preco * item.quantidade).toFixed(2)}\n`;
        valorTotal += item.preco * item.quantidade;
    });

    mensagem += `\nValor total da compra: R$ ${valorTotal.toFixed(2)}`;
    mensagem += `\n\nPor favor, me ajude a finalizar meu pedido.`;

    const whatsappUrl = `https://wa.me/${telefoneLoja}?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');

    sacola = [];
    salvarSacola();
    atualizarSacolaUI();
    sacolaPopup.classList.remove('ativo');
    alert("Seu pedido foi enviado para o WhatsApp da loja! Aguarde o contato para finalizar a compra.");
});


// FIM DAS NOVAS ADIÇÕES PARA CARRINHO E WHATSAPP


// autenticação de login
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário está logado
        usuarioLogado = user;
        console.log("Usuário logado:", user.email);
        loginLogoutLink.textContent = 'Sair';
        loginLogoutLink.href = '#'; // Altera para # para lidar com o logout via JS
        // Remover listener de redirecionamento, se houver
        // Nota: A função 'redirectToLogin' não será aplicada ao loginLogoutLink
        // quando o usuário estiver logado, então não precisamos remover aqui.
        loginLogoutLink.addEventListener('click', handleLogout); // Adiciona o listener de logout
    } else {
        // Usuário não está logado
        usuarioLogado = null;
        console.log("Nenhum usuário logado.");
        loginLogoutLink.textContent = 'Login';
        loginLogoutLink.href = 'login.html'; // Volta ao link original
        loginLogoutLink.removeEventListener('click', handleLogout); // Remove o listener de logout, se houver
        // Não adicionamos 'redirectToLogin' diretamente ao loginLogoutLink aqui.
        // O link já tem o href para 'login.html' e o navegador fará o trabalho.
    }

    atualizarBotoesAdicionarSacola(); // Sempre atualiza os botões "Adicionar à Sacola"
});

// Função para lidar com o clique no botão "Sair"
function handleLogout(event) {
    event.preventDefault(); // Impede o comportamento padrão do link
    signOut(auth).then(() => {
        // Saída bem-sucedida
        console.log("Usuário desconectado.");
        alert("Você foi desconectado.");
        // onAuthStateChanged já cuidará de atualizar a UI
    }).catch((error) => {
        // Ocorreu um erro ao fazer logout
        console.error("Erro ao fazer logout:", error);
        alert("Ocorreu um erro ao tentar desconectar. Tente novamente.");
    });
}

// Função para redirecionar para o login QUANDO NECESSÁRIO (apenas de botões de adicionar)
function redirectToLoginWithMessage(event) {
    event.preventDefault(); // Impede o comportamento padrão do link
    alert("Por favor, faça login para adicionar produtos à sacola.");
    window.location.href = 'login.html';
}


async function atualizarBotoesAdicionarSacola() {
    // Busca novamente todos os botões (se eles já estiverem na DOM)
    document.querySelectorAll('.adicionar-sacola-btn').forEach(button => {
        // Primeiro, remove qualquer listener anterior para evitar duplicação
        const oldListener = button._oldClickListener;
        if (oldListener) {
            button.removeEventListener('click', oldListener);
        }

        // Adiciona um novo listener baseado no status de login
        if (usuarioLogado) {
            // Se logado, o botão adiciona à sacola (com a lógica original)
            const newListener = (event) => {
                const idProduto = event.target.dataset.id;
                const produtoElement = event.target.closest('.produto');
                const nome = produtoElement.querySelector('h3').textContent;
                const precoTexto = produtoElement.querySelector('strong').textContent;
                const preco = parseFloat(precoTexto.replace('R$', '').replace(',', '.').trim());
                const imagem = produtoElement.querySelector('img').src;

                adicionarASacola({ id: idProduto, nome: nome, preco: preco, imagem: imagem });
                alert(`${nome} adicionado à sacola!`); // Feedback para o usuário
            };
            button.addEventListener('click', newListener);
            button._oldClickListener = newListener; // Guarda o listener para futura remoção
            button.textContent = 'Adicionar à Sacola'; // Garante o texto correto
            button.disabled = false; // Garante que o botão não esteja desabilitado
        } else {
            // Se não logado, o botão redireciona para o login COM MENSAGEM
            const newListener = redirectToLoginWithMessage; // Usa a função com mensagem
            button.addEventListener('click', newListener);
            button._oldClickListener = newListener;
            button.textContent = 'Faça login para adicionar'; // Garante o texto correto
            button.disabled = false; // O botão fica visualmente habilitado, mas redireciona
        }
    });
}


// A função carregarProdutos foi alterada para não adicionar listeners diretamente
// em sua primeira chamada, mas sim para que `atualizarBotoesAdicionarSacola`
// gerencie os listeners após o `onAuthStateChanged`.
async function carregarProdutos() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaFiltrada = urlParams.get('categoria');

    let q;

    if (categoriaFiltrada) {
        q = query(produtosRef, where("categoria", "==", categoriaFiltrada));
        if (produtosTitulo) {
            produtosTitulo.textContent = `Produtos de ${categoriaFiltrada}`;
        }
    } else {
        q = produtosRef;
        if (produtosTitulo) {
            produtosTitulo.textContent = "Produtos em Destaque";
        }
    }

    const snapshot = await getDocs(q);
    container.innerHTML = "";

    if (snapshot.empty) {
        container.innerHTML = "<p>Nenhum produto encontrado nesta categoria.</p>";
        return;
    }

    snapshot.forEach((doc) => {
        const p = doc.data();
        const produtoComId = { id: doc.id, ...p };

        const div = document.createElement("div");
        div.classList.add("produto");
        div.innerHTML = `
            <img src="${produtoComId.imagem}" alt="${produtoComId.nome}" width="150" height="150" style="object-fit: cover;">
            <h3>${produtoComId.nome}</h3>
            <p>${produtoComId.descricao}</p>
            <strong>R$ ${parseFloat(produtoComId.preco).toFixed(2)}</strong>
            <button class="adicionar-sacola-btn" data-id="${produtoComId.id}">Adicionar à Sacola</button>
        `;
        container.appendChild(div);
    });

    // Após os produtos serem carregados na DOM, atualiza os botões com base no status de login
    // Isso garante que mesmo na primeira carga, eles já terão o comportamento correto.
    atualizarBotoesAdicionarSacola();
}


// Seu script original para o carrossel (mantido exatamente como você forneceu)
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-item');
const dots = document.querySelectorAll('.carousel-dots .dot');

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        dots[i].classList.remove('active');
    });
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

if (slides.length > 0) {
    showSlide(0);
    setInterval(nextSlide, 5000);
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
});

// Carrega os produtos e a sacola ao iniciar
carregarProdutos();
carregarSacola();