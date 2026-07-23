"use strict";
// ---------- Tipos ----------
Object.defineProperty(exports, "__esModule", { value: true });
const STORAGE_KEY = "clientes";
// ---------- Capturando elementos do DOM ----------
const form = document.getElementById("formDados");
const inputNome = document.getElementById("dadoNome");
const inputCpf = document.getElementById("dadoCpf");
const inputEmail = document.getElementById("dadoEmail");
const inputTelefone = document.getElementById("dadoTelefone");
const inputNascimento = document.getElementById("dadoNascimento");
const inputCep = document.getElementById("cep");
const btnBuscarCep = document.getElementById("btnBuscarCep");
const inputLogradouro = document.getElementById("logradouro");
const inputNumero = document.getElementById("numero");
const inputBairro = document.getElementById("bairro");
const inputCidade = document.getElementById("cidade");
const selectEstado = document.getElementById("estado");
const listaClientesDiv = document.getElementById("clientes");
// ---------- Local storage ----------
function obterClientes() {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (!dados)
        return [];
    try {
        return JSON.parse(dados);
    }
    catch {
        return [];
    }
}
function salvarClientes(clientes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
}
function adicionarCliente(cliente) {
    const clientes = obterClientes();
    clientes.push(cliente);
    salvarClientes(clientes);
}
function removerCliente(id) {
    const clientes = obterClientes().filter((c) => c.id !== id);
    salvarClientes(clientes);
    renderizarClientes();
}
// ---------- Buscar CEP ----------
async function buscarCep() {
    const cepDigitado = inputCep.value.replace(/\D/g, "");
    if (cepDigitado.length !== 8) {
        alert("Digite um CEP válido com 8 dígitos.");
        return;
    }
    const textoOriginal = btnBuscarCep.innerHTML;
    btnBuscarCep.disabled = true;
    btnBuscarCep.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando...';
    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cepDigitado}/json/`);
        if (!resposta.ok) {
            throw new Error("Falha na requisição à API de CEP.");
        }
        const dados = (await resposta.json());
        if (dados.erro) {
            alert("CEP não encontrado.");
            return;
        }
        inputLogradouro.value = dados.logradouro ?? "";
        inputBairro.value = dados.bairro ?? "";
        inputCidade.value = dados.localidade ?? "";
        if (dados.uf) {
            const ufFormatada = dados.uf.charAt(0).toUpperCase() + dados.uf.charAt(1).toLowerCase();
            const opcaoExiste = Array.from(selectEstado.options).some((opt) => opt.value.toLowerCase() === dados.uf.toLowerCase());
            if (opcaoExiste) {
                selectEstado.value = Array.from(selectEstado.options).find((opt) => opt.value.toLowerCase() === dados.uf.toLowerCase()).value;
            }
            else {
                selectEstado.value = ufFormatada;
            }
        }
        inputNumero.focus();
    }
    catch (erro) {
        console.error(erro);
        alert("Não foi possível buscar o CEP. Verifique sua conexão e tente novamente.");
    }
    finally {
        btnBuscarCep.disabled = false;
        btnBuscarCep.innerHTML = textoOriginal;
    }
}
// ---------- Validação simples do formulário ----------
function validarFormulario() {
    if (!inputNome.value.trim() ||
        !inputCpf.value.trim() ||
        !inputEmail.value.trim() ||
        !inputTelefone.value.trim()) {
        alert("Preencha todos os campos obrigatórios.");
        return false;
    }
    const cpfNumeros = inputCpf.value.replace(/\D/g, "");
    if (cpfNumeros.length !== 11) {
        alert("Digite um CPF válido com 11 dígitos.");
        return false;
    }
    return true;
}
function gerarId() {
    return `cliente-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
// ---------- Mostrar lista de clientes ----------
function formatarData(data) {
    if (!data)
        return "Não informado";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}
function renderizarClientes() {
    const clientes = obterClientes();
    listaClientesDiv.innerHTML = "";
    if (clientes.length === 0) {
        listaClientesDiv.innerHTML = "<p>Nenhum cliente cadastrado ainda.</p>";
        return;
    }
    clientes.forEach((cliente) => {
        const card = document.createElement("div");
        card.className = "clienteCard";
        card.innerHTML = `
            <div class="clienteInfo">
                <h3><i class="fa-regular fa-user"></i> ${cliente.nome}</h3>
                <p><strong>CPF:</strong> ${cliente.cpf}</p>
                <p><strong>E-mail:</strong> ${cliente.email}</p>
                <p><strong>Telefone:</strong> ${cliente.telefone}</p>
                <p><strong>Nascimento:</strong> ${formatarData(cliente.nascimento)}</p>
                <p><strong>Endereço:</strong> ${cliente.logradouro || "-"}, ${cliente.numero || "s/n"} -
                   ${cliente.bairro || "-"}, ${cliente.cidade || "-"}/${cliente.estado || "-"}
                   (CEP: ${cliente.cep || "-"})</p>
            </div>
            <button type="button" class="botao btnRemover" data-id="${cliente.id}">
                <i class="fa-solid fa-trash"></i> Remover
            </button>
        `;
        listaClientesDiv.appendChild(card);
    });
    // Liga os botões de remover recém-criados
    listaClientesDiv.querySelectorAll(".btnRemover").forEach((botao) => {
        botao.addEventListener("click", () => {
            const id = botao.dataset.id;
            if (id && confirm("Deseja realmente remover este cliente?")) {
                removerCliente(id);
            }
        });
    });
}
// ---------- Envio do formulário ----------
function limparFormulario() {
    form.reset();
}
function tratarEnvioFormulario(evento) {
    evento.preventDefault();
    if (!validarFormulario())
        return;
    const novoCliente = {
        id: gerarId(),
        nome: inputNome.value.trim(),
        cpf: inputCpf.value.trim(),
        email: inputEmail.value.trim(),
        telefone: inputTelefone.value.trim(),
        nascimento: inputNascimento.value,
        cep: inputCep.value.trim(),
        logradouro: inputLogradouro.value.trim(),
        numero: inputNumero.value.trim(),
        bairro: inputBairro.value.trim(),
        cidade: inputCidade.value.trim(),
        estado: selectEstado.value,
    };
    adicionarCliente(novoCliente);
    renderizarClientes();
    limparFormulario();
    alert("Cliente cadastrado com sucesso!");
}
// ---------- Inicialização ----------
document.addEventListener("DOMContentLoaded", () => {
    renderizarClientes();
});
btnBuscarCep.addEventListener("click", buscarCep);
form.addEventListener("submit", tratarEnvioFormulario);
//# sourceMappingURL=cliente.js.map