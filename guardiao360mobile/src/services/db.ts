import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

const getDb = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('guardiao360.db');
  }
  return dbInstance;
};

export const initDB = async () => {
  const db = await getDb();

  try {
    // 1. Criação das Tabelas (Estrutura Base)
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS ocorrencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER, 
        uuid_local TEXT,
        numero_ocorrencia TEXT,
        tipo_viatura TEXT,
        numero_viatura TEXT,
        grupamento TEXT,
        ponto_base TEXT,
        cod_local_ocorrencia TEXT,
        forma_acionamento TEXT,
        local_vtr_acionamento TEXT,
        data_acionamento TEXT,
        hora_acionamento TEXT,
        latitude_partida TEXT,
        longitude_partida TEXT,
        latitude_chegada TEXT,
        longitude_chegada TEXT,
        data_hora_chegada_local TEXT,
        
        -- Colunas de Endereço (Novas)
        regiao TEXT,
        ais TEXT,
        municipio TEXT,
        bairro TEXT,
        tipo_logradouro TEXT,
        logradouro TEXT,
        numero_km TEXT,
        complemento TEXT,
        ponto_referencia TEXT,

        natureza_final TEXT,
        grupo TEXT,
        subgrupo TEXT,
        situacao_ocorrencia TEXT,
        motivo_nao_atendida TEXT,
        detalhe_sem_atuacao TEXT,
        historico_final TEXT,
        chefe_guarnicao TEXT,
        hora_saida_local TEXT,
        status TEXT
      );

      CREATE TABLE IF NOT EXISTS vitimas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ocorrencia_id INTEGER,
        nome TEXT,
        sexo TEXT,
        idade TEXT,
        classificacao TEXT,
        etnia TEXT,
        lgbt TEXT,
        destino TEXT,
        tipo_hospital TEXT,
        nome_hospital TEXT,
        sofreu_acidente_transito TEXT,
        condicao_seguranca TEXT,
        assinatura_path TEXT,
        status_assinatura TEXT,
        FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias (id)
      );

      CREATE TABLE IF NOT EXISTS midias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ocorrencia_id INTEGER,
        tipo TEXT,
        data_captura TEXT,
        caminho_arquivo TEXT,
        FOREIGN KEY (ocorrencia_id) REFERENCES ocorrencias (id)
      );
    `);

    // 2. MIGRAÇÃO FORÇADA (Adiciona colunas se faltarem)
    // Tenta adicionar cada coluna individualmente. Se já existir, o catch captura e segue.
    const colunasParaAdicionar = [
      'usuario_id INTEGER',
      'regiao TEXT',
      'ais TEXT',
      'municipio TEXT',
      'bairro TEXT',
      'tipo_logradouro TEXT',
      'logradouro TEXT',
      'numero_km TEXT',
      'complemento TEXT',
      'ponto_referencia TEXT'
    ];

    for (const colunaDef of colunasParaAdicionar) {
      try {
        const nomeColuna = colunaDef.split(' ')[0]; // Pega só o nome para o log
        await db.runAsync(`ALTER TABLE ocorrencias ADD COLUMN ${colunaDef};`);
        console.log(`✅ Coluna ${nomeColuna} adicionada.`);
      } catch (e) {
        // Ignora erro se a coluna já existe
      }
    }

    console.log('✅ Banco de Dados Inicializado e Migrado');

  } catch (error) {
    console.error('❌ Erro initDB:', error);
  }
};

// --- ADAPTADOR (executeSql) ---
export const executeSql = async (sql: string, params: any[] = []) => {
  const db = await getDb();
  const isSelect = sql.trim().toUpperCase().startsWith('SELECT');

  try {
    if (isSelect) {
      const result = await db.getAllAsync(sql, params);
      return {
        rows: {
          _array: result,
          length: result.length,
          item: (index: number) => result[index]
        }
      };
    } else {
      const result = await db.runAsync(sql, params);
      return {
        insertId: result.lastInsertRowId,
        rowsAffected: result.changes,
        rows: { _array: [], length: 0, item: () => null }
      };
    }
  } catch (error) {
    console.error(`❌ Erro SQL: ${sql}`, error);
    throw error;
  }
};