// ---------- Tipos ----------

interface Cliente {
    id: string;
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
    nascimento: string;
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
}

interface ViaCepResponse {
    cep?: string;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    erro?: boolean;
}

const STORAGE_KEY = "clientes";

// ---------- Capturando elementos do DOM ----------

const form = document.getElementById("formDados") as HTMLFormElement;
const inputNome = document.getElementById("dadoNome") as HTMLInputElement;
const inputCpf = document.getElementById("dadoCpf") as HTMLInputElement;
const inputEmail = document.getElementById("dadoEmail") as HTMLInputElement;
const inputTelefone = document.getElementById("dadoTelefone") as HTMLInputElement;
const inputNascimento = document.getElementById("dadoNascimento") as HTMLInputElement;
const inputCep = document.getElementById("cep") as HTMLInputElement;
const btnBuscarCep = document.getElementById("btnBuscarCep") as HTMLButtonElement;
const inputLogradouro = document.getElementById("logradouro") as HTMLInputElement;
const inputNumero = document.getElementById("numero") as HTMLInputElement;
const inputBairro = document.getElementById("bairro") as HTMLInputElement;
const inputCidade = document.getElementById("cidade") as HTMLInputElement;
const selectEstado = document.getElementById("estado") as HTMLSelectElement;
const listaClientesDiv = document.getElementById("clientes") as HTMLDivElement;

// ---------- Local storage ----------

function obterClientes(): Cliente[] {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (!dados) return [];
    try {
        return JSON.parse(dados) as Cliente[];
    } catch {
        return [];
    }
}

function salvarClientes(clientes: Cliente[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
}

function adicionarCliente(cliente: Cliente): void {
    const clientes = obterClientes();
    clientes.push(cliente);
    salvarClientes(clientes);
}

function removerCliente(id: string): void {
    const clientes = obterClientes().filter((c) => c.id !== id);
    salvarClientes(clientes);
    renderizarClientes();
}

// ---------- Buscar CEP ----------

async function buscarCep(): Promise<void> {
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

        const dados = (await resposta.json()) as ViaCepResponse;

        if (dados.erro) {
            alert("CEP não encontrado.");
            return;
        }

        inputLogradouro.value = dados.logradouro ?? "";
        inputBairro.value = dados.bairro ?? "";
        inputCidade.value = dados.localidade ?? "";

        if (dados.uf) {
            const ufFormatada =
                dados.uf.charAt(0).toUpperCase() + dados.uf.charAt(1).toLowerCase();

            const opcaoExiste = Array.from(selectEstado.options).some(
                (opt) => opt.value.toLowerCase() === dados.uf!.toLowerCase()
            );

            if (opcaoExiste) {
                selectEstado.value = Array.from(selectEstado.options).find(
                    (opt) => opt.value.toLowerCase() === dados.uf!.toLowerCase()
                )!.value;
            } else {
                selectEstado.value = ufFormatada;
            }
        }

        inputNumero.focus();
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível buscar o CEP. Verifique sua conexão e tente novamente.");
    } finally {
        btnBuscarCep.disabled = false;
        btnBuscarCep.innerHTML = textoOriginal;
    }
}

// ---------- Validação simples do formulário ----------

function validarFormulario(): boolean {
    if (
        !inputNome.value.trim() ||
        !inputCpf.value.trim() ||
        !inputEmail.value.trim() ||
        !inputTelefone.value.trim()
    ) {
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

function gerarId(): string {
    return `cliente-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// ---------- Mostrar lista de clientes ----------

function formatarData(data: string): string {
    if (!data) return "Não informado";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function renderizarClientes(): void {
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
    listaClientesDiv.querySelectorAll<HTMLButtonElement>(".btnRemover").forEach((botao) => {
        botao.addEventListener("click", () => {
            const id = botao.dataset.id;
            if (id && confirm("Deseja realmente remover este cliente?")) {
                removerCliente(id);
            }
        });
    });
}

// ---------- Envio do formulário ----------

function limparFormulario(): void {
    form.reset();
}

function tratarEnvioFormulario(evento: SubmitEvent): void {
    evento.preventDefault();

    if (!validarFormulario()) return;

    const novoCliente: Cliente = {
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