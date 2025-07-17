const CATEGORY_GROUPS = {
    "Core Access": ["Starter", "Extender", "Consistency"],
    "Disruption": ["Interruption", "Hand Trap"],
    "Board Reset": ["Board Breaker", "Floodgate"],
    "Win Setup": ["Wincon", "Time", "Bick"]
};
const categoryOptions  = [
    'Starter', 'Extender', 'Board Breaker', 'Floodgate',
    'Hand Trap', 'Wincon', 'Time', 'Bick', 'Consistency', 'Interruption'
];


function computeGlobalStats() {
  const nameCells = document.querySelectorAll("#deck-body .name");

  let monsters = 0, spells = 0, traps = 0;
  const attributes = {};

  nameCells.forEach(cell => {
    const type = cell.getAttribute("data-type")?.toLowerCase() || "";
    const attr = cell.getAttribute("data-attribute") || "UNKNOWN";
    const qty = parseInt(cell.getAttribute("data-qty") || "1");

    if (type.includes("monster")) monsters += qty;
    else if (type.includes("spell")) spells += qty;
    else if (type.includes("trap")) traps += qty;

    attributes[attr] = (attributes[attr] || 0) + qty;
  });

  // Mise à jour de l'encart
  document.getElementById("count-monster").textContent = monsters;
  document.getElementById("count-spell").textContent = spells;
  document.getElementById("count-trap").textContent = traps;

//   const attrList = document.getElementById("attribute-list");
//   attrList.innerHTML = "";
//   Object.entries(attributes).forEach(([key, val]) => {
//     const li = document.createElement("li");
//     li.textContent = `${key} : ${val}`;
//     attrList.appendChild(li);
//   });
}



function cleanCardTable(){
    document.querySelectorAll('.card-row').forEach(element => {
        element.remove();
    });
    const tbody = document.getElementById("category-summary-body");
    tbody.innerHTML = '';
}
async function addToDeck(card) {
    const deckBody = document.getElementById('deck-body');
    // const row = document.createElement('div');
    const selectId = `qty-${card.id}`;
    const qtySelect = `<select class="qty-select" data-card-id="${card.id}">
        <option value="1" selected>1</option>
        <option value="2">2</option>
        <option value="3">3</option>
    </select>`;
    const engineSelect = `<select class="engine-select">
        <option value="">-</option>
        <option value="Engine 1">Engine 1</option>
        <option value="Engine 2">Engine 2</option>
        <option value="Engine 3">Engine 3</option>
        <option value="Staple">Staple</option>
    </select>`;
    const catContainer = createCategorySelector();
    // <td><img src="${card.card_images[0].image_url_small}" alt=""></td>
    const cardRow = `
        <div 
            class="card-row name" 
            data-type="${card.type}" 
            data-race="${card.race}" 
            data-level="${card.level || ''}" 
            data-attribute="${card.attribute || ''}" 
        >${card.name}</div>
        <div class="card-row"><span class="card-type">${card.type}<span></div>
        <div class="card-row qty">${qtySelect}</div>
        <div class="card-row">${engineSelect}</div>
        <div class="card-row cat-container"></div>
        <div class="card-row probability-cell">—</div>
        <div  class="card-row"><button class="btn btn-danger remove-row-btn">✖</button></div>
    `;

    // 1. Création du node temporaire
    const temp = document.createElement('div');
    temp.innerHTML = cardRow.trim();

    const qty = temp.querySelector(".qty-select");
    const nameCell = temp.querySelector(".card-row.name");
    qty.addEventListener("change", () => {
        const newQty = parseInt(qty.value);
        nameCell.setAttribute("data-qty", newQty.toString());
    });
    // 2. Ajout de chaque enfant au deckBody
    Array.from(temp.children).forEach(child => {
        deckBody.appendChild(child);
    });
    const lastRow = getLastGridRow('.deck-table-grid', 7);
    lastRow[4].appendChild(catContainer);
    // const selectedCats = Array.from(row.querySelector('.cat-select').selectedOptions).map(opt => opt.value);
    updateDeckCount();
    updateProbabilities();
    computeGlobalStats();

    // document.getElementById('search-results-list').innerHTML = "";

    return true;
}
function createCategorySelector() {
    try {
        let catSelected = [];
        const container = document.createElement('div');
        container.classList.add('category-container');

        // Div pour afficher les catégories sélectionnées
        const display = document.createElement('div');
        display.className = 'chips-categories';
        container.appendChild(display);
        const arrow = document.createElement('span');
        arrow.className = 'dropdown-arrow';
        arrow.innerHTML = '&#9662;';
        display.appendChild(arrow);

        // Création du select
        const select = document.createElement('div');
        select.className = 'dropdown-list';
        categoryOptions.forEach(cat => {
            if (!catSelected.includes(cat)) {
            const item = document.createElement('div');
            item.textContent = cat;
            item.onclick = (e) => {
                e.stopPropagation();
                addChip(cat);
                showDropdown(false);
            };
            select.appendChild(item);
            }
        });

        container.appendChild(select);

        // Ouvre le dropdown au clic sur la zone
        container.addEventListener('click', (e) => {
            if (select.classList.contains('show')) {
                showDropdown(false);
            } else {
                showDropdown(true);
            }
        });
        
        // // Ferme le dropdown si clic en dehors
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target) && !select.contains(e.target)) {
                showDropdown(false);
            }
        });

        // Accessibilité : Esc pour fermer, Tab pour sortir
        container.addEventListener('keydown', (e) => {
            if (e.key === "Escape") showDropdown(false);
            if (e.key === "Tab") showDropdown(false);
        });

        function renderChips() {
            // On vide sauf la flèche
            display.innerHTML = '';
            catSelected.forEach(value => {
                const chip = document.createElement('span');
                chip.className = 'chip';
                chip.textContent = value;
                const btn = document.createElement('button');
                btn.textContent = '×';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    removeChip(value);
                };
                chip.appendChild(btn);
                display.appendChild(chip);
            });
            display.appendChild(arrow);
        }        
        function renderDropdown() {
            select.innerHTML = '';
            categoryOptions.forEach(opt => {
                if (!catSelected.includes(opt)) {
                    const item = document.createElement('div');
                    item.textContent = opt;
                    item.onclick = (e) => {
                        e.stopPropagation();
                        addChip(opt);
                        showDropdown(false);
                    };
                    select.appendChild(item);
                }
            });
            if (select.innerHTML.trim() === '') {
                const none = document.createElement('div');
                none.textContent = 'Aucune option';
                none.style.color = '#aaa';
                select.appendChild(none);
            }
        }
        function addChip(value) {
            if (!catSelected.includes(value)) {
                catSelected.push(value);
                renderChips();
            }
        }
        function removeChip(value) {
            catSelected = catSelected.filter(val => val !== value);
            renderChips();
        }
        
        // Gestion du dropdown
        function showDropdown(show) {
            if (show) {
                renderDropdown();
                select.classList.add('show');
            } else {
                select.classList.remove('show');
            }
        }

        // // Initialisation
        // renderChips();
        container.addCategory = function(cat) {
            addChip(cat);
        };
        container.setCategories = function(categories) {
            categories.forEach(cat => addChip(cat));
        };
        container.getCategories = function() {
            return [...catSelected];
        };
        return container;
    } catch(error){
        console.log(error)
    }
}
function updateDeckCount() {
    const selects = document.querySelectorAll(".qty-select");
    let total = 0;
    selects.forEach(select => {
    total += parseInt(select.value);
    });
    document.getElementById("deck-count").textContent = total;
    updateProbabilities();
    updateCategorySummary();
}
function updateProbabilities() {
    const totalCards = Array.from(document.querySelectorAll(".qty-select"))
    .reduce((sum, select) => sum + parseInt(select.value), 0);
    const cols = 7; // nombre de colonnes dans ta grid
    const gridRows = getDeckGridRows('.deck-table-grid', cols);
    gridRows.forEach(rowCells  => {
        const qtyCell = rowCells.find(cell => cell.querySelector('.qty-select'));
        const probCell = rowCells.find(cell => cell.classList.contains('probability-cell'));
        const qtySelect = qtyCell ? qtyCell.querySelector('.qty-select') : null;

        if (!qtySelect || !probCell) return;

        const k = 0;          // on veut au moins 1 carte
        const n = 5;          // cartes piochées en main de départ
        const K = parseInt(qtySelect.value); // nombre de cette carte
        const N = totalCards;

        const probability = 1 - hypergeometricDist(k, n, K, N);
        probCell.textContent = (probability * 100).toFixed(2) + '%';
    });
}
function hypergeometricDist(k, n, K, N) {
    const comb = (n, k) => {
        if (k > n) return 0;
        if (k === 0 || k === n) return 1;
        let result = 1;
        for (let i = 1; i <= k; i++) {
            result *= (n - (k - i));
            result /= i;
        }
        return result;
    };
    return comb(K, k) * comb(N - K, n - k) / comb(N, n);
}

function updateCategorySummary() {
    try {
        const rows = getDeckGridRows('.deck-table-grid', 7);
        const tbody = document.getElementById("category-summary-body");
        const summary = {};
        const engineSummary = {};
        let totalCards = 0;
        tbody.innerHTML = "";
        rows.forEach(row => {
            const cardName = row[0]?.textContent.trim();
            const qty = parseInt(row[2]?.querySelector('.qty-select')?.value || "0");
            const engine = row[3]?.querySelector('.engine-select')?.value;
            const select = row[4].querySelector(".category-container");
            const selected = select?.getCategories ? select.getCategories() : [];
            totalCards += qty;

            // Par catégorie
            selected.forEach(cat => {
                if (!summary[cat]) summary[cat] = new Map();
                summary[cat].set(cardName, qty);
            });

            // Par engine
            if (engine && engine.startsWith("Engine")) {
                if (!engineSummary[engine]) engineSummary[engine] = new Map();
                engineSummary[engine].set(cardName, qty);
            }
        });

        Object.entries(engineSummary).forEach(([engineName, cardMap]) => {
            const row = document.createElement("tr");
            const K = Array.from(cardMap.values()).reduce((a, b) => a + b, 0);
            const probs = [];

            for (let x = 1; x <= 5; x++) {
                const p = 1 - cumulativeHypergeometric(x - 1, 5, K, totalCards);
                probs.push((p * 100).toFixed(2) + "%");
            }

            row.innerHTML = `
                <td><strong>${engineName}</strong></td>
                <td>${K}</td>
                ${probs.map(p => `<td>${p}</td>`).join("")}
            `;
            tbody.appendChild(row);
        });
        // rows.forEach(row => {
        //     const select = row[4].querySelector(".category-container");
        //     const name = select.getCategories();
        //     const qty = parseInt(row[2]?.value  || "0");
        //     const selected = select.getCategories();

        //     totalCards += qty;

        //     // Associer la carte à chaque catégorie (sans double-comptage des copies)
        //     selected.forEach(cat => {
        //         if (!summary[cat]) summary[cat] = new Map();
        //         summary[cat].set(name, qty); // écrase si redondant, donc pas de doublon
        //     });
        // });

        

        // 3. Category Summary
        Object.keys(summary).forEach(cat => {
            const cardMap = summary[cat];
            const K = Array.from(cardMap.values()).reduce((a, b) => a + b, 0);
            const row = document.createElement("tr");
            const probs = [];
            for (let x = 1; x <= 5; x++) {
                const cumulative = cumulativeHypergeometric(x - 1, 5, K, totalCards);
                const p = 1 - cumulative;
                probs.push((p * 100).toFixed(2) + "%");
            }
            row.innerHTML = `
                <td>${cat}</td>
                <td>${K}</td>
                ${probs.map(p => `<td>${p}</td>`).join("")}
            `;
            tbody.appendChild(row);
        });


        // 4. Category Groups
        Object.entries(CATEGORY_GROUPS).forEach(([groupName, includedCats]) => {
            const cardSet = new Map();
            includedCats.forEach(cat => {
                if (summary[cat]) {
                    summary[cat].forEach((qty, cardName) => {
                        // évite le double comptage
                        if (!cardSet.has(cardName)) {
                            cardSet.set(cardName, qty);
                        }
                    });
                }
            });
            const K = Array.from(cardSet.values()).reduce((a, b) => a + b, 0);
            const row = document.createElement("tr");
            const probs = [];
            for (let x = 1; x <= 5; x++) {
                const p = 1 - cumulativeHypergeometric(x - 1, 5, K, totalCards);
                probs.push((p * 100).toFixed(2) + "%");
            }
            row.innerHTML = `
            <td><strong>${groupName}</strong></td>
            <td>${K}</td>
            ${probs.map(p => `<td>${p}</td>`).join("")}
            `;
            tbody.appendChild(row);
        });

        
    } catch (error) {
        console.error(error)
    }
}
function cumulativeHypergeometric(maxSuccesses, draws, K, N) {
    let sum = 0;
    for (let k = 0; k <= maxSuccesses; k++) {
        sum += hypergeometricDist(k, draws, K, N);
    }
    return sum;
}
          // function addToDeck(card) {
          //   getLocalImageUrl(card).then(imageUrl => {
          //       const row = document.createElement('tr');
          //       row.innerHTML = `
          //         <td><img src="${imageUrl}" alt=""></td>
          //         <td>${card.name}</td>
          //         <td>${card.type}</td>
          //         <td><button onclick="this.closest('tr').remove()">✖</button></td>
          //       `;
          //       deckBody.appendChild(row);
          //   });
          // }

          // function getLocalImageUrl(card) {
          //   const id = card.id;
          //   const localPath = `/assets/cards-image/${id}.jpg`;
          //   return fetch(localPath, { method: 'HEAD' })
          //     .then(response => {
          //       if (response.ok) {
          //         return localPath; // L'image est en cache local
          //       } else {
          //         // Pas trouvée en local : on retourne l’URL distante ET on la télécharge
          //         const remoteUrl = card.card_images[0].image_url_small;
          //         fetch(remoteUrl)
          //           .then(res => res.blob())
          //           .then(blob => {
          //             const formData = new FormData();
          //             formData.append("id", id);
          //             formData.append("file", blob, `${id}.jpg`);
          //             fetch("/cache-image", {
          //               method: "POST",
          //               body: formData
          //             });
          //           });
          //         return remoteUrl;
          //       }
          //     })
          //     .catch(() => card.card_images[0].image_url_small);
          // }

async function fetchCardByName(name) {
    const response = await fetch(`/search?q=${encodeURIComponent(name)}`);
    if (!response.ok) return null;
    const cards = await response.json();
    return cards.find(c => c.name === name || c.name_en === name) || null;
}
function exportDeckToFile() {
    const rows = getDeckGridRows('.deck-table-grid', 7); // chaque row est un array de 7 <div>
    const deck = [];

    rows.forEach(row => {
        // Récupère les infos par index de colonne (adapte si tu changes la structure !)
        const name = row[0].textContent.trim();
        const type = row[1].textContent.trim();
        const qty = parseInt(row[2].querySelector(".qty-select")?.value || "0");
        const engine = row[3].querySelector(".engine-select")?.value || "";

        // Pour les catégories, on utilise getCategories du category-container
        const catContainer = row[4].querySelector('.category-container');
        let categories = [];
        if (catContainer && typeof catContainer.getCategories === 'function') {
            categories = catContainer.getCategories();
        } else {
            // fallback: cherche les chips .chip à l'intérieur
            categories = Array.from(row[4].querySelectorAll(".chip"))
                .map(tag => tag.textContent.replace("×", "").trim());
        }

        deck.push({
            name,
            type,
            quantity: qty,
            categories,
            engine
        });
    });

    const json = JSON.stringify(deck, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "deck.json";
    a.click();

    URL.revokeObjectURL(url);
}
function importDeckFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) throw new Error("Format JSON invalide");

        cleanCardTable() // vide l’ancien deck
        for(const card of data){
            const infoCard = await fetchCardByName(card.name);
            addToDeck(infoCard).then(res => {
                if(res){
                const lastRow = getLastGridRow('.deck-table-grid', 7);
                lastRow[2].querySelector(".qty-select").value = card.quantity;
                if (card.engine) {
                    lastRow[3].querySelector(".engine-select").value = card.engine;
                }
                const select = lastRow[4].querySelector(".category-container");
                // card.categories.forEach(cat => {

                //     const option = Array.from(select.options).find(o => o.value === cat);
                //     if (option) {
                //     select.value = cat;
                //     select.dispatchEvent(new Event("change"));
                //     }
                // });
                if (select && typeof select.setCategories === 'function') {
                    select.setCategories(card.categories || []);
                }
                }
            });
        }
        // data.forEach(card => {
        //   if (card.name && card.quantity) {
        //     // simule la sélection depuis recherche
        //     fetchCardByName(card.name).then(info => {
        //       if (info) {
                
        //         // Une fois ajoutée, applique quantité/catégories/engine
        //         setTimeout(() => {
        //           const lastRow = document.querySelector("#deck-body tr:last-child");

        //           lastRow.querySelector(".qty-select").value = card.quantity;

        //           if (card.engine) {
        //             lastRow.querySelector(".engine-select").value = card.engine;
        //           }

        //           const select = lastRow.querySelector("select.cat-select");
        //           card.categories.forEach(cat => {
        //             const option = Array.from(select.options).find(o => o.value === cat);
        //             if (option) {
        //               select.value = cat;
        //               select.dispatchEvent(new Event("change"));
        //             }
        //           });

                
        //         }, 100);
        //       }
        //     });
        //   }
        // });
        updateDeckCount();
        computeGlobalStats();
        updateCategorySummary();
      } catch (err) {
        alert("Erreur à l'import : " + err.message);
      }
    };

    reader.readAsText(file);
}

function getDeckGridRows(gridSelector, cols) {
    const grid = document.querySelector(gridSelector);
    const children = Array.from(grid.children);
    const rowCount = Math.floor((children.length - cols) / cols);
    const rows = [];
    for (let r = 0; r < rowCount; r++) {
        // Un tableau avec les cellules de la ligne (peut aussi être un NodeList)
        const rowCells = children.slice(cols + r * cols, cols + (r + 1) * cols);
        rows.push(rowCells);
    }
    return rows;
}
function getLastGridRow(gridSelector, cols) {
    const grid = document.querySelector(gridSelector);
    const children = Array.from(grid.children);
    const rowCount = Math.floor((children.length - cols) / cols);
    if (rowCount === 0) return null; // pas de lignes de données
    const start = cols + (rowCount - 1) * cols;
    const end = start + cols;
    return children.slice(start, end); // array des cellules de la dernière ligne
}

function enableGridRowDeletion(gridSelector, cols, btnClass = 'remove-row-btn', onDelete) {
    const grid = typeof gridSelector === 'string' ? document.querySelector(gridSelector) : gridSelector;
    if (!grid) return;
    grid.addEventListener('click', function(e) {
        if (e.target.classList.contains(btnClass)) {
            const children = Array.from(grid.children);
            const idx = children.indexOf(e.target.closest('.card-row'));
            const headerCount = cols; // On suppose la première "ligne" = header (cols divs)
            const row = Math.floor((idx - headerCount) / cols);
            if (row >= 0) {
                const start = headerCount + row * cols;
                for (let i = 0; i < cols; i++) {
                    if (grid.children[start]) grid.children[start].remove();
                }
                if (typeof onDelete === 'function') onDelete();
            }
        }
    });
}