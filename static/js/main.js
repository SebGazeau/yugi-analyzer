document.addEventListener("DOMContentLoaded", (event) => {


        document.addEventListener("change", function (e) {
            if (e.target.classList.contains("qty-select") || e.target.classList.contains("engine-select")) {
                updateDeckCount();
                updateProbabilities();
                updateCategorySummary();
                computeGlobalStats();
            }
        });


    enableGridRowDeletion('.deck-table-grid', 7, 'remove-row-btn', updateDeckCount);
});