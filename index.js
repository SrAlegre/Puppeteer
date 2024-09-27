const puppeteer = require("puppeteer");
const fs = require("fs");
const pool = require("./db"); // Importando a conexão do banco de dados

// Lista de lojas com nome e URL
const stores = [
  {
    name: "teste",
    franquia_id: "48",
    url: "",
  },
  // Adicione mais lojas conforme necessário
];

var TARGET_USER_ID; // Variável global para armazenar a key do usuário

// Função para obter a key da pessoa da última avaliação inserida
async function getLastInsertedPersonKey() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT p.key
      FROM avaliacao a
      JOIN Pessoa p ON a.fk_pessoa_id_pessoa = p.id_pessoa
      ORDER BY a.id_avalicao DESC
      LIMIT 1;
    `);

    if (res.rows.length > 0) {
      TARGET_USER_ID = res.rows[0].key; // Atribui a key à variável global
      console.log('Key da pessoa da última avaliação inserida:', TARGET_USER_ID);
    } else {
      console.log('Nenhuma avaliação encontrada.');
    }
  } catch (err) {
    console.error('Erro ao buscar a key da pessoa:', err);
  } finally {
    client.release();
  }
}

// Função para inserir as avaliações no banco de dados
async function insertReviews(reviews) {
  const client = await pool.connect();
  try {
    await Promise.all(reviews.map(async (review) => {
      await client.query(`
        WITH nova_pessoa AS (
          INSERT INTO Pessoa (usuario, key)
          VALUES ($1, $2)
          RETURNING id_pessoa
        )
        INSERT INTO avaliacao (fk_unidade_id_unidade, fk_pessoa_id_pessoa, nota, dia_referencia, comentario)
        VALUES (
          (SELECT id_unidade FROM unidade WHERE franquia_id = $3),
          (SELECT id_pessoa FROM nova_pessoa),
          $4,
          $5,
          $6
        )
      `, [review.usuario, review.key, review.franquia_id, review.nota, parseRelativeDate(review.dia_referencia), review.comentario]);
    }));
    console.log('Avaliações inseridas com sucesso!');
  } catch (err) {
    console.error('Erro ao inserir avaliações:', err);
  } finally {
    client.release();
  }
}

// Função para converter datas relativas em formato ISO
// function parseRelativeDate(relativeDate) {
//   const today = new Date();
//   const dateMap = {
//     "um dia atrás": 1,
//     "2 dias atrás": 2,
//     "5 dias atrás": 5,
//     "uma semana atrás": 7,
//     "2 semanas atrás": 14,
//     "3 semanas atrás": 21,
//     "um mês atrás": 30,
//   };

//   if (relativeDate in dateMap) {
//     const days = dateMap[relativeDate];
//     const date = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
//     return date.toISOString().split('T')[0];
//   } else {
//     throw new Error(`Data relativa desconhecida: ${relativeDate}`);
//   }
// }


// Atualize a função de conversão de data

// Função para converter data relativa
function parseRelativeDate(relativeDate) {
  const dateMap = {
   
      "um dia atrás": 1,
      "2 dias atrás": 2,
      "5 dias atrás": 5,
      "uma semana atrás": 7,
      "2 semanas atrás": 14,
      "3 semanas atrás": 21,
      "um mês atrás": 30,
    
    // Dias
    "um dia atrás": 1,
    "dois dias atrás": 2,
    "três dias atrás": 3,
    "quatro dias atrás": 4,
    "cinco dias atrás": 5,
    "seis dias atrás": 6,
    "sete dias atrás": 7,
    
    "2 dias atrás": 2,
    "3 dias atrás": 3,
    "4 dias atrás": 4,
    "5 dias atrás": 5,
    "6 dias atrás": 6,
    "7 dias atrás": 7,
    
    // Semanas
    "uma semana atrás": 7,
    "duas semanas atrás": 14,
    "três semanas atrás": 21,
    "quatro semanas atrás": 28,

    "uma semana atrás": 7,
    "2 semanas atrás": 14,
    "3 semanas atrás": 21,
    "4 semanas atrás": 28,
  
    // Meses
    "um mês atrás": 30,
    "dois meses atrás": 60,
    "três meses atrás": 90,
    "quatro meses atrás": 120,
    "cinco meses atrás": 150,
    "seis meses atrás": 180,

    "2 meses atrás": 60,
    "3 meses atrás": 90,
    "4 meses atrás": 120,
    "5 meses atrás": 150,
    "6 meses atrás": 180,
    
    // Anos
    "um ano atrás": 365,
    "2 anos atrás": 730,
    
    
    // Outras
    "hoje": 0,
    "ontem": 1,
    "anteontem": 2,
    "este mês": 30, // Considera o último mês como um período de 30 dias
    "mês passado": 30,
    "este ano": 365, // Considera o ano atual como 365 dias
    "ano passado": 365,
  
    // Horas
    "uma hora atrás": 1 / 24,
    "2 horas atrás": 2 / 24,
    "3 horas atrás": 3 / 24,
    "4 horas atrás": 4 / 24,
    "5 horas atrás": 5 / 24,
    "6 horas atrás": 6 / 24,
    "7 horas atrás": 7 / 24,
    "8 horas atrás": 8 / 24,
    "9 horas atrás": 9 / 24,
    "10 horas atrás": 10 / 24,
    "1 horas atrás": 11 / 24,
    "12 horas atrás": 12 / 24,
    "13 horas atrás": 12 / 24,

  
    // Minutos
    "um minuto atrás": 1 / (24 * 60),
    "dois minutos atrás": 2 / (24 * 60),
    "três minutos atrás": 3 / (24 * 60),
    "quatro minutos atrás": 4 / (24 * 60),
    "cinco minutos atrás": 5 / (24 * 60),
    "seis minutos atrás": 6 / (24 * 60),
    "sete minutos atrás": 7 / (24 * 60),
    "oito minutos atrás": 8 / (24 * 60),
    "nove minutos atrás": 9 / (24 * 60),
    "dez minutos atrás": 10 / (24 * 60),
    "onze minutos atrás": 11 / (24 * 60),
    "doze minutos atrás": 12 / (24 * 60),
  };

  const today = new Date();
  
  // Verifica se a data é relativa
  if (relativeDate in dateMap) {
    const days = dateMap[relativeDate];
    const calculatedDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
    return calculatedDate.toISOString().split('T')[0];
  } else {
    throw new Error(`Data relativa desconhecida: ${relativeDate}`);
  }
}


async function scrapeReviews(store) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  console.log(`Acessando a loja: ${store.name}`);

  await page.goto(store.url, { waitUntil: "networkidle2" });

  await page.waitForSelector('button[aria-label="Classificar avaliações"]');
  await page.click('button[aria-label="Classificar avaliações"]');
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Pausa de 2 segundos
  await page.waitForSelector('div[data-index="1"]');
  await page.click('div[data-index="1"]');
  await new Promise((resolve) => setTimeout(resolve, 5000)); // Pausa de 5 segundos

  // Função de rolagem para carregar avaliações
  const loadMoreReviews = async () => {
    await page.evaluate(async () => {
      const scrollDiv = document.querySelector(
        ".m6QErb.DxyBCb.kA9KIf.dS8AEf.XiKgde"
      );
      if (!scrollDiv) return;

      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const scrollInterval = 100;
      const scrollStep = 10000;

      while (true) {
        scrollDiv.scrollBy(0, scrollStep);
        await delay(scrollInterval);

        if (
          scrollDiv.scrollHeight - scrollDiv.scrollTop ===
          scrollDiv.clientHeight
        ) {
          break;
        }
      }
    });
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Pausa de 5 segundos
  };

  // Carregar avaliações até encontrar o ID do usuário alvo
  let finalReviews = [];
  let userFound = false;
  const seenUserIds = new Set(); // Usar um Set para rastrear IDs já vistos

  while (!userFound) {
    await loadMoreReviews();

    const reviews = await page.evaluate(() => {
      const reviewElements = document.querySelectorAll("div[data-review-id]");
      const reviewsData = [];

      for (const review of reviewElements) {
        const reviewId = review.getAttribute("data-review-id");
        const ariaLabel =
          review
            .querySelector("button[aria-label]")
            ?.getAttribute("aria-label")
            ?.replace("Foto de ", "") || "";
        const rating =
          review.querySelector(".kvMYJc")?.getAttribute("aria-label") || "";
        const comment =
          review
            .querySelector('div[class*="MyEned"] span')
            ?.textContent.replace(/\n/g, "")
            .trim() || "";
        const date =
          review.querySelector("span.rsqaWe")?.textContent.trim() || "";
        reviewsData.push({
          key: reviewId,
          usuario: ariaLabel,
          nota: rating.replace(/estrela[s]?/i, '').trim(),
          comentario: comment,
          dia_referencia: date, // Alterações feitas aqui
        });
      }

      return reviewsData;
    });

    // Verificar se o ID do usuário alvo está entre as avaliações coletadas
    for (const review of reviews) {
      // Ignorar se o ID já foi visto
      if (seenUserIds.has(review.key)) {
        continue;
      }
      seenUserIds.add(review.key); // Adicionar o ID ao Set

      finalReviews.push({
        ...review, // Adiciona a avaliação com os novos campos
        franquia_id: store.franquia_id, // Adiciona o franquia_id
      });

      if (review.key === TARGET_USER_ID) {
        userFound = true;
        break;
      }
    }
  }

  // Inverter a ordem das avaliações para inserir do último ao primeiro
  finalReviews.reverse();

  // Salvar as avaliações em um arquivo JSON
  fs.writeFileSync(
    `${store.name.replace(/[^a-zA-Z0-9]/g, "_")}_reviews.json`,
    JSON.stringify(finalReviews, null, 2)
  );

  console.log(`Dados das avaliações para ${store.name} foram salvos.`);

  // Inserir as avaliações no banco de dados
  await insertReviews(finalReviews);

  await browser.close();
}

(async () => {
  await getLastInsertedPersonKey(); // Obtém a key antes de iniciar o scraping

  for (const store of stores) {
    await scrapeReviews(store);
  }
})();
