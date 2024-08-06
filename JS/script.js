// Dados iniciais dos produtos e vendedores
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

const vendors = ['valdir', 'fabio', 'barbacena', 'coimbra'];

const initialData = vendors.reduce((acc, vendor) => {
    acc[vendor] = products.map(product => ({
        ...product,
        entrada: 0,
        saida: 0
    }));
    return acc;
}, {});

let currentVendor = 'valdir';

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    loadVendorData();
    setupEventListeners();
});

function loadVendorData() {
    const tbody = document.getElementById('product-tbody');
    const vendorData = initialData[currentVendor];

    tbody.innerHTML = vendorData.map(product =>
        `<tr>
            <td>${product.nome}</td>
            <td>${product.unidade}</td>
            <td>${product.preco}</td>
            <td><input type="number" value="${product.entrada}" data-product="${product.nome}" data-unidade="${product.unidade}" class="entrada"></td>
            <td><input type="number" value="${product.saida}" data-product="${product.nome}" data-unidade="${product.unidade}" class="saida"></td>
            <td class="estoque">${Math.max(product.entrada - product.saida, 0)}</td>
            <td class="total">${(Math.max(product.entrada - product.saida, 0) * product.preco).toFixed(2)}</td>
        </tr>`
    ).join('');

    document.getElementById('vendedor-title').textContent = currentVendor.charAt(0).toUpperCase() + currentVendor.slice(1);
}

function setupEventListeners() {
    document.querySelectorAll('nav button').forEach(button => {
        button.addEventListener('click', () => {
            const vendorId = button.id;
            if (vendorId !== currentVendor) {
                document.getElementById(currentVendor).classList.remove('active');
                currentVendor = vendorId;
                button.classList.add('active');
                loadVendorData();
            }
        });
    });

    document.querySelectorAll('input.entrada, input.saida').forEach(input => {
        input.addEventListener('input', updateInventory);
    });

    document.getElementById('download-pdf').addEventListener('click', downloadPDF);
}

function updateInventory() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        const productName = input.getAttribute('data-product');
        const unit = input.getAttribute('data-unidade');
        const value = parseFloat(input.value) || 0;
        const vendorData = initialData[currentVendor];

        const product = vendorData.find(p => p.nome === productName && p.unidade === unit);
        if (product) {
            if (input.classList.contains('entrada')) {
                product.entrada = value;
            } else if (input.classList.contains('saida')) {
                product.saida = value;
            }
            const estoque = Math.max(product.entrada - product.saida, 0);
            input.closest('tr').querySelector('td.estoque').textContent = estoque;
            input.closest('tr').querySelector('td.total').textContent = (estoque * product.preco).toFixed(2);
        }
        saveToLocalStorage();
    });
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const vendorName = currentVendor.charAt(0).toUpperCase() + currentVendor.slice(1);

    doc.text(`Estoque de ${vendorName}`, 10, 10);

    const table = document.getElementById('product-table');
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    const rows = Array.from(table.querySelectorAll('tbody tr')).map(row => {
        return Array.from(row.querySelectorAll('td')).map(td => {
            if (td.querySelector('input')) {
                return td.querySelector('input').value; // Captura os valores dos inputs
            }
            return td.textContent.trim();
        });
    });

    doc.autoTable({
        head: [headers],
        body: rows,
        startY: 20,
        margin: { left: 10, right: 10 },
        styles: { fontSize: 8 },
        theme: 'striped',
        columnWidth: 'wrap',
    });

    doc.save(`estoque_${vendorName}.pdf`);
}

function saveToLocalStorage() {
    localStorage.setItem('vendorData', JSON.stringify(initialData));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('vendorData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        Object.keys(parsedData).forEach(vendor => {
            parsedData[vendor].forEach(product => {
                const productKey = `${vendor}-${product.nome}-${product.unidade}`;
                if (initialData[vendor]) {
                    const prod = initialData[vendor].find(p => p.nome === product.nome && p.unidade === product.unidade);
                    if (prod) {
                        prod.entrada = product.entrada;
                        prod.saida = product.saida;
                    }
                }
            });
        });
    }
}
