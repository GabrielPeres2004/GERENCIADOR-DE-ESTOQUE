document.addEventListener('DOMContentLoaded', () => {
    loadVendorData(); // Inicializa a tabela com dados padrão
    document.getElementById('vendor-input').addEventListener('input', updateVendorName);
    document.getElementById('download-pdf').addEventListener('click', downloadPDF);
    document.getElementById('product-tbody').addEventListener('input', updateInventory);
});

const products = [
    { nome: 'KIFOL CALCIO E BORO', unidade: 'GL', preco: 250 },
    { nome: 'KIFOL CALCIO E BORO', unidade: 'LT', preco: 55 },
    { nome: 'KIFOL CUPRATIL', unidade: 'GL', preco: 525 },
    { nome: 'KIFOL CUPRATIL', unidade: 'LT', preco: 110 },
    { nome: 'KIFOL ZINFOL', unidade: 'GL', preco: 525 },
    { nome: 'KIFOL ZINFOL', unidade: 'LT', preco: 110 },
    { nome: 'KIFOL TEKS', unidade: 'GL', preco: 380 },
    { nome: 'KIFOL TEKS', unidade: 'LT', preco: 78 },
    { nome: 'KIFOL AMINO FLOWER', unidade: 'GL', preco: 380 },
    { nome: 'KIFOL AMINO FLOWER', unidade: 'LT', preco: 78 },
    { nome: 'KIFOL BORO 10%', unidade: 'GL', preco: 380 },
    { nome: 'KIFOL BORO 10%', unidade: 'LT', preco: 78 },
    { nome: 'KIFOL KIPHO-30', unidade: 'GL', preco: 280 },
    { nome: 'KIFOL KIPHO-30', unidade: 'LT', preco: 61 },
    { nome: 'KIFOL FOSFITO 40-20', unidade: 'GL', preco: 380 },
    { nome: 'KIFOL FOSFITO 40-20', unidade: 'LT', preco: 78 },
    { nome: 'KIFOL GREENFOL', unidade: 'GL', preco: 280 },
    { nome: 'KIFOL GREENFOL', unidade: 'LT', preco: 61 },
    { nome: 'KIFOL COBMOL 250ML', unidade: 'FC', preco: 165 },
    { nome: 'KIFOL COBMOL', unidade: 'LT', preco: 640 },
    { nome: 'KIFOL AMINO PLANT', unidade: 'FC', preco: 165 },
    { nome: 'KIFOL AMINO PLANT', unidade: 'LT', preco: 480 },
    { nome: 'KIFOL STRIKE', unidade: 'KG', preco: 65 },
    { nome: 'KIFOL CALCIO 27%', unidade: 'KG', preco: 65 },
    { nome: 'KIFOL 09-50-10', unidade: 'KG', preco: 65 },
    { nome: 'KIFOL MICROS', unidade: 'KG', preco: 65 },
    { nome: 'KIFOL 00-10-50', unidade: 'KG', preco: 65 },
    { nome: 'KIFOL ORGANICS', unidade: '05 LT', preco: 185 },
    { nome: 'KIFOL ORGANICS', unidade: '10 LT', preco: 320 },
    { nome: 'KIFOL ORGANICS', unidade: '20 LT', preco: 600 }
];

function loadVendorData() {
    const tbody = document.getElementById('product-tbody');
    tbody.innerHTML = products.map(product =>
        `<tr>
            <td>${product.nome}</td>
            <td>${product.unidade}</td>
            <td>${product.preco.toFixed(2)}</td>
            <td><input type="number" value="0" data-product="${product.nome}" data-unidade="${product.unidade}" class="entrada"></td>
            <td><input type="number" value="0" data-product="${product.nome}" data-unidade="${product.unidade}" class="saida"></td>
            <td class="estoque">0</td>
            <td class="total">0.00</td>
        </tr>`
    ).join('');

    document.getElementById('vendor-input').value = '';
    document.getElementById('vendedor-title').textContent = 'Nome do Vendedor';
    updateInventory(); // Atualiza os valores na tabela
}

function updateVendorName() {
    const vendorName = document.getElementById('vendor-input').value || 'Nome do Vendedor';
    document.getElementById('vendedor-title').textContent = vendorName;
}

function updateInventory() {
    const rows = document.querySelectorAll('#product-tbody tr');
    let totalPrice = 0;

    rows.forEach(row => {
        const preco = parseFloat(row.cells[2].textContent) || 0;
        const entrada = parseFloat(row.querySelector('input.entrada').value) || 0;
        const saida = parseFloat(row.querySelector('input.saida').value) || 0;
        const estoque = Math.max(entrada - saida, 0); // Garante que o estoque não seja negativo
        const total = estoque * preco;

        row.querySelector('.estoque').textContent = estoque;
        row.querySelector('.total').textContent = total.toFixed(2);

        totalPrice += total;
    });

    document.getElementById('total-price').textContent = totalPrice.toFixed(2);
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const vendorName = document.getElementById('vendor-input').value || 'Nome do Vendedor';

    doc.text(`Relatório de Estoque - ${vendorName}`, 10, 10);

    const table = document.getElementById('product-table');
    const headers = [];
    const body = [];
    let totalSum = 0;

    // Captura os cabeçalhos
    table.querySelectorAll('thead tr').forEach(headerRow => {
        const headerCells = headerRow.querySelectorAll('th');
        const headerTexts = Array.from(headerCells).map(cell => cell.textContent);
        headers.push(headerTexts);
    });

    // Captura o corpo da tabela
    table.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = Array.from(cells).map(cell => {
            const input = cell.querySelector('input');
            return input ? input.value : cell.textContent.trim();
        });
        body.push(rowData);
        totalSum += parseFloat(rowData[6]) || 0; // Somando o total de cada produto
    });

    // Adiciona linha de total
    body.push([
        '', '', '', '', '', 'Valor Total:', totalSum.toFixed(2)
    ]);

    doc.autoTable({
        head: headers,
        body: body,
        startY: 20,
        theme: 'grid',
        styles: { fontSize: 8 }
    });

    doc.save(`relatorio_estoque_${vendorName}.pdf`);
}
