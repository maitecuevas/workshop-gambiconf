# 🎓 Workshop: Contribuindo com Open Source usando GitHub Copilot @ GambiConf

Bem-vindo(a)! Este repositório foi criado especialmente para o nosso workshop na **GambiConf**. Aqui, vamos aprender na prática como contribuir para um projeto Open Source, utilizando a inteligência artificial do **GitHub Copilot** para nos ajudar.

O projeto é um **Mural de Gambiarras**. O workshop está dividido em **duas fases**:

- **Fase 1:** Adicione sua gambiarra ao mural
- **Fase 2:** Resolva uma issue do repositório e contribua com novas funcionalidades

Ao final, você terá feito duas contribuições reais para um projeto Open Source! 🎉

---

## 📋 Pré-requisitos

Para participar deste workshop, você só precisa de:

1.  Uma conta no **GitHub**.
2.  Acesso à internet (faremos tudo no navegador!).

*Nota: O GitHub Codespaces já vem com o VS Code, Git e Copilot configurados para você.*

---

## 🎯 Fase 1: Sua Primeira Contribuição - Adicione sua Gambiarra

Siga este guia detalhado. Se tiver dúvidas, levante a mão! 🙋‍♂️🙋‍♀️

### 1. Fork🍴

O primeiro passo em muitos projetos Open Source é fazer uma cópia do projeto para a sua conta. Isso se chama **Fork**.

*   Clique no botão **Fork** no canto superior direito desta página.
*   Isso criará uma cópia deste repositório no **seu** GitHub.

### 2. Abrir no Codespaces ☁️

Não vamos instalar nada! Vamos usar um computador na nuvem.

1.  No **seu** fork, clique no botão verde **Code**.
2.  Selecione a aba **Codespaces**.
3.  Clique no botão verde **Create codespace on main**.
4.  Aguarde o ambiente carregar no seu navegador.

### 3. Branch 🌿

Nunca trabalhe diretamente na `main`! Vamos criar uma branch separada para a sua contribuição.

No terminal do Codespaces (parte inferior da tela), digite:

```bash
git checkout -b gambiarra-SEUNOME
```

*(Troque `SEUNOME` pelo seu nome ou apelido)*

### 4. Hora do Código com Copilot 🤖

Agora vem a parte divertida! Vamos adicionar sua gambiarra usando o poder do Chat.

1.  Certifique-se de que você está com o **Copilot Chat** aberto.
2.  Digite um comando direto para ele, como no exemplo abaixo:

    > @workspace Adicione uma nova gambiarra no arquivo messages.json. Meu nome é [Seu Nome] e minha gambiarra é: "[Sua Gambiarra]".

    *Exemplo real:*
    > "@workspace Adicione uma nova gambiarra no arquivo messages.json. Meu nome é @pachicodes e minha gambiarra é usar fita crepe para segurar o cabo de rede."

3.  O Copilot vai entender a estrutura do projeto, encontrar o arquivo certo e sugerir a edição.
4.  Clique no botão para **Aplicar** (Apply) a alteração sugerida.
5.  Verifique se ficou tudo certo e salve o arquivo!

### 5. Testando no Navegador 🧪

Antes de enviar, veja se funcionou!
Instale a extensão Live Server e teste.

### 6. Commit e Push upload 📤

Salvando e enviando para o GitHub.

```bash
git add data/messages.json
git commit -m "Adiciona gambiarra de [Seu Nome]"
git push origin gambiarra-SEUNOME
```

Você também pode pedir para o Copilot criar o PR para você !

### 7. Pull Request (PR) 🔀

O momento da verdade!

1.  Vá até a página do **seu** fork no GitHub.
2.  Você verá um aviso amarelo "Compare & pull request". Clique nele!
3.  Verifique se as mudanças estão corretas.
4.  Escreva um título e descrição para o seu PR.
    *   *Dica:* Use o Copilot na descrição do PR para resumir o que você fez!
5.  Clique em **Create pull request**.

---

## 💡 Dicas de Prompts para o Copilot

Experimente perguntar essas coisas para o Copilot Chat durante o workshop:

*   `@workspace Como esse projeto carrega as mensagens na tela?`
*   `Explique o que o arquivo css/style.css está fazendo com as cores dos cards.`
*   `Como eu posso melhorar a acessibilidade do index.html?`


---


## 🎯 Fase 2: Resolva uma Issue e Contribua com uma Feature

Agora que você já sabe como contribuir, é hora de resolver um problema real! 🛠️

### Como Participar da Fase 2:

1.  **Escolha uma Issue:**
    *   Vá para o arquivo [`ISSUES.md`](ISSUES.md) ou acesse a aba **Issues** no GitHub
    *   Escolha uma issue que te interesse
    *   Deixe um comentário dizendo que vai trabalhar nela para evitar duplicação!

2.  **Crie uma Nova Branch:**
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feature/nome-da-feature
    ```

3.  **Use o Copilot para Ajudar:**
    *   Pergunte ao Copilot sobre a issue escolhida
    *   Exemplo: `@workspace Como implementar um dark mode toggle neste projeto?`
    *   Deixe o Copilot te guiar na implementação!

4.  **Teste Suas Mudanças:**
Live Server xD

5.  **Commit e Push:**
    ```bash
    git add .
    git commit -m "Implementa [nome da feature] - closes #número-da-issue"
    git push origin feature/nome-da-feature
    ```

    Ou peça pro Copilot criar o PR

6.  **Abra o Pull Request:**
    *   Na descrição, mencione qual issue você está resolvendo
    *   Exemplo: "Closes #1" ou "Resolve #3"
    *   Explique o que foi implementado e como testar

---

## 🌟 Dicas para a Fase 2

- **Comunique-se:** Se tiver dúvidas sobre uma issue, pergunte!
- **Use o Copilot:** Ele pode explicar o código existente e sugerir implementações
- **Teste bem:** Garanta que sua feature funciona antes de abrir o PR
- **Peça review:** Não tenha vergonha de pedir feedback!

---

**Bom workshop!** 🚀
