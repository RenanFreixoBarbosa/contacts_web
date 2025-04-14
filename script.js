const form = document.getElementById('contact-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const contactList = document.getElementById('contact-list');

let contacts = [];
let editingId = null;

// Função para buscar contatos
async function fetchContacts() {
  const res = await fetch('http://localhost:5000/api/contacts/');
  const data = await res.json();
  contacts = data;
  renderContacts();
}

async function saveOrEditContact() {
  const nome = nameInput.value.trim();
  const email = emailInput.value.trim();
  const telefone = phoneInput.value.replace(/\D/g, ''); // Remove a máscara do telefone

  if (nome && email && telefone) {
    if (editingId === null) {
      // Criar novo contato
      await fetch('http://localhost:5000/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nome,
          address: email,
          phone: telefone
        }),
      });
    } else {
      // Editar contato
      await fetch('http://localhost:5000/api/contact/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: editingId,
          name: nome,
          address: email,
          phone: telefone
        }),
      });
      editingId = null; // Limpa o id após a edição
    }

    form.reset();
    fetchContacts(); // Recarrega os contatos após salvar
  }
};

//Renderizar Contatos
function renderContacts() {
  contactList.innerHTML = '';
  contacts.forEach((contact) => {
    const li = document.createElement('li');
    const formattedPhone = formatPhone(contact.telefone);

    li.innerHTML = `
      <div>
        <strong>${contact.nome}</strong><br />
        📧 ${contact.email}<br />
        📱 ${formattedPhone}
      </div>
      <div class="actions">
        <button class="edit" onclick="editContact(${contact.id})">✏️</button>
        <button class="delete" onclick="deleteContact(${contact.id})">🗑️</button>
      </div>
    `;

    contactList.appendChild(li);
  });
}

function editContact(id) {
  const contact = contacts.find(c => c.id === id);
  if (contact) {
    nameInput.value = contact.nome;
    emailInput.value = contact.email;
    phoneInput.value = contact.telefone;
    editingId = id;
  }
}
async function deleteContact(id) {
  if (confirm("Tem certeza que deseja excluir este contato?")) {
    await fetch('http://localhost:5000/api/contact/', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contact_id: id })
    });
    fetchContacts();
  }
}

// Máscara de telefone
function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

phoneInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');

  if (value.length > 11) value = value.slice(0, 11);

  if (value.length >= 2 && value.length <= 6) {
    value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
  } else if (value.length > 6) {
    value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  }

  e.target.value = value;
});

// Buscar contatos assim que a página carregar
fetchContacts();
