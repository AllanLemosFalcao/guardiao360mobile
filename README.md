# 🚒 Guardião 360 Mobile & Online 

#### Projeto acadêmico (3º período - ADS) focado na aplicação prática de desenvolvimento de sistemas.

O **Guardião 360** é um sistema multiplataforma (Aplicativo Mobile + API Backend) focado no registro, gerenciamento e acompanhamento de ocorrências táticas (desenvolvido para as rotinas do Corpo de Bombeiros).

A arquitetura do aplicativo é **Offline-First**, permitindo que as guarnições registrem dados de despacho, cheguem à cena, coletem assinaturas e anexem mídias mesmo em áreas sem cobertura de rede. Os dados são salvos localmente e sincronizados com o servidor central assim que a conexão é restabelecida.

## ✨ Principais Funcionalidades

* **📱 Operação Offline:** Banco de dados SQLite local embarcado.

* **🔄 Sincronização Bidirecional:** Atualização em segundo plano baixando chamados da central e enviando relatórios finalizados.

* **📍 Geolocalização:** Captura automática de coordenadas GPS na saída da viatura e na chegada à cena (QTA).

* **🗺️ Mapa Operacional:** Interface de mapas interativos (`react-native-maps`) para visualização de ocorrências ativas e finalizadas, com *fallback* elegante para acessos via navegador Web.

* **⏱️ Linha do Tempo (Timeline):** Reconstrução visual da cronologia da ocorrência (Início, Chegada, Fotos, Finalização).

* **✍️ Assinatura Digital:** Recurso para coletar a assinatura da vítima ou responsável na própria tela do dispositivo.

* **📸 Anexos e Mídias:** Captura de fotos e vídeos para composição do relatório de cena.

* **📷 Leitor de QR Code:** Ferramenta simulada para leitura e vinculação de equipamentos operacionais.

## 🛠️ Stack Tecnológico

### 📱 Frontend (Mobile & Web)

* **Framework:** React Native + Expo

* **Linguagem:** TypeScript

* **Navegação:** React Navigation

* **Armazenamento:** Expo SQLite (Local) e Async Storage (Sessão)

* **Mapas & GPS:** Expo Location, React Native Maps

* **Comunicação:** Axios

### 💻 Backend (API)

* **Ambiente:** Node.js

* **Framework:** Express

* **Linguagem:** TypeScript

* **Banco de Dados:** MySQL (driver `mysql2` com connection pool)

* **Segurança:** Autenticação via JSON Web Token (JWT)

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos

* [Node.js](https://nodejs.org/) (v18+)

* Banco de dados MySQL rodando localmente (Ex: XAMPP, WAMP, MySQL Workbench)

* App **Expo Go** instalado no celular (para testes mobile).

### 1. Configurando o Banco de Dados

1. No seu servidor MySQL, crie um banco de dados chamado `guardiao360mobile_db`.

2. Importe o arquivo `guardiao360mobile (1).sql` fornecido na raiz do projeto para criar as tabelas e os dados de teste.

### 2. Rodando o Backend

1. Abra o terminal na pasta `guardiao360mobile-backend`.

2. Instale as dependências:

   ```
   npm install
   
   ```

3. Inicie o servidor TypeScript. Ele rodará por padrão na porta **3001**:

   ```
   npx ts-node src/server.ts
   
   ```

   *(Verifique a mensagem de sucesso e a porta exibida no console).*

### 3. Rodando o Frontend

1. Abra um **novo** terminal na pasta `guardiao360mobile`.

2. Instale as dependências:

   ```
   npm install
   
   ```

3. **Ajuste o IP:** Descubra o IP IPv4 da sua máquina na sua rede Wi-Fi (ex: `192.168.1.15`).

   * Vá em `src/services/api.ts` e atualize a URL da API para apontar para o backend:

     ```
     const API_URL = 'http://SEU_IPV4_AQUI:3001/api'; 
     
     ```

4. Inicie o servidor do Expo:

   ```
   npx expo start
   
   ```

5. **Para testar no celular:** Escaneie o QR Code com o Expo Go (celular e PC devem estar na mesma rede Wi-Fi).

6. **Para testar na Web:** Pressione `w` no terminal para rodar diretamente no navegador do PC.

## 🔐 Acesso de Teste (Mock Data)

Utilize as seguintes credenciais para testar o sistema (dados presentes no script SQL):

* **Usuário:** Capitão Silva (Admin)

  * **Email:** `admin@bombeiros.pe.gov.br`

  * **Senha:** `123`

* **Usuário:** Soldado Rocha (Operacional)

  * **Email:** `rocha@bombeiros.pe.gov.br`

  * **Senha:** `123`

## 📂 Estrutura de Pastas Resumida

```
/
├── guardiao360mobile-backend/    # Lógica de servidor, rotas, auth e conexão MySQL
└── guardiao360mobile/            # Aplicativo Frontend
    ├── src/
    │   ├── screens/              # Telas (Login, Home, Ocorrencias, Mapas, etc.)
    │   ├── services/             # Lógica de sincronização, API e SQLite (db.ts, syncService.ts)
    │   ├── components/           # Componentes reutilizáveis de interface
    │   └── data/                 # Arquivos de apoio e listas estáticas (naturezas.ts)
    └── App.tsx                   # Roteamento e Inicialização do App

```
