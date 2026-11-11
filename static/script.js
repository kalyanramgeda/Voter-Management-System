
const voterForm = document.getElementById("voterForm");
const voterTable = document.getElementById("voterTable");
const searchInput = document.getElementById("searchInput");

let editingVoterId = null;


// READ: Fetch and display voters
async function loadVoters(search = "") {
    try {
        const response = await fetch(
            `/api/voters?search=${encodeURIComponent(search)}`
        );

        const data = await response.json();

        voterTable.innerHTML = "";

        if (!data.voters.length) {
            voterTable.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-message">
                        No voter records found
                    </td>
                </tr>
            `;
            return;
        }

        data.voters.forEach(voter => {
            const row = document.createElement("tr");

            const values = [
                voter.voter_id,
                voter.name,
                voter.age,
                voter.gender,
                voter.state,
                voter.constituency
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "edit-btn";
            editButton.addEventListener("click", () => editVoter(voter));

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";
            deleteButton.addEventListener("click", () => {
                deleteVoter(voter.voter_id);
            });

            actionCell.append(editButton, deleteButton);
            row.appendChild(actionCell);
            voterTable.appendChild(row);
        });

    } catch (error) {
        alert("Unable to load voter records");
        console.error(error);
    }
}


// CREATE / UPDATE: Submit voter form
voterForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const voter = {
        voter_id: document.getElementById("voter_id").value.trim(),
        name: document.getElementById("name").value.trim(),
        age: document.getElementById("age").value,
        gender: document.getElementById("gender").value,
        state: document.getElementById("state").value.trim(),
        constituency: document.getElementById("constituency").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim()
    };

    const isEditing = editingVoterId !== null;

    const url = isEditing
        ? `/api/voters/${encodeURIComponent(editingVoterId)}`
        : "/api/voters";

    const method = isEditing ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(voter)
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Operation failed");
            return;
        }

        alert(result.message);

        resetForm();
        await loadVoters();
        await loadDashboard();

    } catch (error) {
        alert("Server connection failed");
        console.error(error);
    }
});


// UPDATE: Load voter details into form
function editVoter(voter) {
    editingVoterId = voter.voter_id;

    document.getElementById("voter_id").value = voter.voter_id;
    document.getElementById("name").value = voter.name;
    document.getElementById("age").value = voter.age;
    document.getElementById("gender").value = voter.gender;
    document.getElementById("state").value = voter.state;
    document.getElementById("constituency").value = voter.constituency;
    document.getElementById("phone").value = voter.phone || "";
    document.getElementById("email").value = voter.email || "";

    document.getElementById("voter_id").disabled = true;
    document.getElementById("formTitle").textContent = "Update Voter";
    document.getElementById("submitButton").textContent = "Update Voter";
    document.getElementById("cancelEdit").hidden = false;

    document.getElementById("add-voter").scrollIntoView({
        behavior: "smooth"
    });
}


// Reset form
function resetForm() {
    voterForm.reset();
    editingVoterId = null;

    document.getElementById("voter_id").disabled = false;
    document.getElementById("formTitle").textContent = "Register New Voter";
    document.getElementById("submitButton").textContent = "Add Voter";
    document.getElementById("cancelEdit").hidden = true;
}


// Cancel editing
document.getElementById("cancelEdit").addEventListener("click", resetForm);


// DELETE: Remove voter
async function deleteVoter(voterId) {
    if (!confirm(`Are you sure you want to delete ${voterId}?`)) {
        return;
    }

    try {
        const response = await fetch(
            `/api/voters/${encodeURIComponent(voterId)}`,
            { method: "DELETE" }
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.error);
            return;
        }

        alert(result.message);

        await loadVoters(searchInput.value);
        await loadDashboard();

    } catch (error) {
        alert("Unable to delete voter");
        console.error(error);
    }
}


// DASHBOARD: Load statistics
async function loadDashboard() {
    try {
        const response = await fetch("/api/dashboard");
        const data = await response.json();

        document.getElementById("totalVoters").textContent =
            data.total_voters;

        document.getElementById("maleVoters").textContent =
            data.male_voters;

        document.getElementById("femaleVoters").textContent =
            data.female_voters;

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}


// SEARCH: Search by voter ID or name
searchInput.addEventListener("input", function() {
    loadVoters(this.value);
});


// Initial page loading
document.addEventListener("DOMContentLoaded", function() {
    loadVoters();
    loadDashboard();
});
