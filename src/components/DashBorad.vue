<template>
  <div class="wrapper">
    <h2>Welcome, {{ user?.name }}</h2>
    <div class="input-box button">
      <input type="button" value="Logout" @click="logout" />
    </div>
    <div v-if="loadingInvitations">Loading invitations...</div>
    <div v-if="errorInvitations" class="error">{{ errorInvitations }}</div>

    <div v-if="invitations.length === 0">No invitations found.</div>

    <ul v-if="invitations.length > 0">
      <li v-for="invite in invitations" :key="invite.id">
        <span>Project: {{ invite.project.name }} — </span>
        <span>Email invited: {{ invite.email }} — </span>
        <span v-if="invite.status !== 'accepted'" style="display: inline-block;height:35px; width: 100px;"
          class="input-box button">
          <input type="button" value="Accept" @click="acceptInvitation(invite.token)" />
        </span>
      </li>

    </ul>


    <h2>Projects Dashboard</h2>
    <div class="input-box button">
      <input type="button" value="+ New Project" @click="openCreateModal" />
    </div>
    <div v-if="projects.length">
      <table class="project-table">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in projects" :key="project.id">
            <td @click="viewProject(project.id)" style="cursor: pointer; font-weight: bold;">
              {{ project.name }}
            </td>
            <td>{{ project.description }}</td>
            <td>
              <div class="input-box button">
                <input type="button" value="Edit" @click="openEditModal(project.id)">
              </div>
              <div class="input-box button"><input type="button" value="Delete" @click="deleteProject(project.id)">
              </div>
              <div class="input-box button"><input type="button" value="Invite" @click="openInviteModal(project.id)">
              </div>
              <router-link :to="`/projects/${project.id}/tasks`">
                <div class="input-box button"><input type="button" value="Manage Tasks" /></div>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

    <!-- Create/Edit Modal -->


    <!-- Invite Modal -->
    <div v-if="showInviteModal" class="modal">
      <h3>Invite to Project</h3>
      <form @submit.prevent="inviteToProject">
        <input v-model="invite.email" type="email" placeholder="Email" required />
        <input v-model="invite.user_id" type="number" placeholder="User ID" required />
        <button type="submit">Send Invite</button>
        <button type="button" @click="closeInviteModal">Cancel</button>
      </form>
    </div>

    <!-- Invite Modal -->
    <div v-if="showInviteModal" class="modal-overlay">
      <div class="modal">
        <h3>Invite to Project</h3>
        <form @submit.prevent="inviteToProject">
          <div class="input-box">
            <label for="user">Select User</label>
            <select v-model="invite.user_id" @change="onUserSelect">
              <option disabled value="">-- Select a User --</option>
              <option v-for="user in allUsers" :key="user.id" :value="user.id">
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
          </div>

          <div class="input-box button">
            <input type="submit" value="Send Invite" />
          </div>
          <div class="input-box button">
            <input type="button" value="Cancel" @click="closeInviteModal" />
          </div>
        </form>

      </div>
    </div>

    <!-- Project Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ selectedProject.name }}</h3>
        <p>{{ selectedProject.description }}</p>
        <div class="input-box button">
          <input type="button" value="Close" @click="closeDetailModal" />
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ isEditing ? 'Edit Project' : 'Create Project' }}</h3>
        <form @submit.prevent="isEditing ? updateProject() : createProject()">
          <div class="input-box">
            <input v-model="form.name" type="text" placeholder="Project Name" required />
          </div>
          <div class="input-box">
            <textarea v-model="form.description" placeholder="Project Description" required></textarea>
          </div>
          <div class="input-box button">
            <input type="submit" :value="isEditing ? 'Update' : 'Create'" />
          </div>
          <div class="input-box button">
            <input type="button" value="Cancel" @click="closeModal" />
          </div>
        </form>
      </div>
    </div>


    <!-- Project Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ selectedProject.name }}</h3>
        <p>{{ selectedProject.description }}</p>
        <div class="input-box button">
          <input type="button" value="Close" @click="closeDetailModal" />
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ isEditing ? 'Edit Project' : 'Create Project' }}</h3>
        <form @submit.prevent="isEditing ? updateProject() : createProject()">
          <div class="input-box">
            <input v-model="form.name" type="text" placeholder="Project Name" required />
          </div>
          <div class="input-box">
            <textarea v-model="form.description" placeholder="Project Description" required></textarea>
          </div>
          <div class="input-box button">
            <input type="submit" :value="isEditing ? 'Update' : 'Create'" />
          </div>
          <div class="input-box button">
            <input type="button" value="Cancel" @click="closeModal" />
          </div>
        </form>
      </div>
    </div>
  </div>

</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      invitations: [],
      loadingInvitations: false,
      errorInvitations: null,
      user: null,
      projects: [],
      allUsers: [],
      invitations: [],
      form: { name: '', description: '', id: null },
      invite: { email: '' },
      selectedProject: {},
      selectedProjectId: null,
      showModal: false,
      showInviteModal: false,
      showDetailModal: false,
      isEditing: false,
    };
  },
  async created() {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/user', this.getAuthHeaders());
      this.user = res.data;
      this.fetchInvitations(); // <- fetch invitations once user is known
    } catch {
      this.$router.push('/login');
    }
    this.getProjects();
  },
  methods: {
    getAuthHeaders() {
      return {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      };
    },
    async logout() {
      try {
        await axios.post('http://127.0.0.1:8000/api/logout', {}, this.getAuthHeaders());
        localStorage.removeItem('token');
        this.$router.push('/login');
      } catch {
        alert('Logout failed');
      }
    },
    async getProjects() {
      const res = await axios.get('http://127.0.0.1:8000/api/projects', this.getAuthHeaders());

      this.projects = (res.data.owned_projects || []).concat(res.data.invited_projects || []);
    },


    openCreateModal() {
      this.isEditing = false;
      this.form = { name: '', description: '', id: null };
      this.showModal = true;
      console.log(this.showModal);
    },
    openEditModal(id) {
      const project = this.projects.find(p => p.id === id);
      this.form = Object.assign({}, project)
      this.isEditing = true;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async fetchInvitations() {
      this.loadingInvitations = true;
      this.errorInvitations = null;
      try {
        const response = await fetch('http://127.0.0.1:8000/api/invitations',
          this.getAuthHeaders(),
        );
        if (!response.ok) throw new Error('Failed to fetch invitations');
        this.invitations = await response.json();
      } catch (error) {
        this.errorInvitations = error.message;
      } finally {
        this.loadingInvitations = false;
      }
    },
    async acceptInvite(inviteToken) {
      try {
        await axios.get(`http://127.0.0.1:8000/api/accept-invite/${inviteToken}`);
        alert('Invitation accepted!');
        this.getProjects();     // refresh project list
        this.fetchInvitations();  // refresh invitation list
      } catch (err) {
        alert('Failed to accept invite');
        console.error(err);
      }
    },
    async createProject() {
      await axios.post('http://127.0.0.1:8000/api/projects', this.form, this.getAuthHeaders());
      this.closeModal();
      this.getProjects();
    },
    async updateProject() {
      await axios.put(`http://127.0.0.1:8000/api/projects/${this.form.id}`, this.form, this.getAuthHeaders());
      this.closeModal();
      this.getProjects();
    },
    async deleteProject(id) {
      await axios.delete(`http://127.0.0.1:8000/api/projects/${id}`, this.getAuthHeaders());
      this.getProjects();
    },
    async viewProject(id) {
      const res = await axios.get(`http://127.0.0.1:8000/api/projects/${id}`, this.getAuthHeaders());
      this.selectedProject = res.data;
      this.showDetailModal = true;
    },
    closeDetailModal() {
      this.showDetailModal = false;
    },
    onUserSelect() {
      const selected = this.allUsers.find(u => u.id === this.invite.user_id);
      if (selected) {
        this.invite.email = selected.email;
      }
    },
    async openInviteModal(projectId) {
      this.selectedProjectId = projectId;
      this.showInviteModal = true;

      try {
        const res = await axios.get('http://127.0.0.1:8000/api/getUsers', this.getAuthHeaders());
        this.allUsers = res.data.users;
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    },

    closeInviteModal() {
      this.showInviteModal = false;
    },
    async inviteToProject() {
      await axios.post(`http://127.0.0.1:8000/api/projects/${this.selectedProjectId}/invite`, this.invite, this.getAuthHeaders());
      this.closeInviteModal();
    },
  }
};
</script>

<style scoped>
.wrapper {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}

.project-card {
  padding: 10px;
  border: 1px solid #ccc;
  margin: 10px 0;
}

.modal {
  position: fixed;
  background: white;
  padding: 20px;
  border: 1px solid #000;
  top: 20%;
  left: 30%;
  width: 40%;
  z-index: 1000;
  display: block !important;
  background-color: rgba(255, 255, 255, 0.95);
  /* debug visibility */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9998;
}

.input-box {
  margin: 10px 0;
}

.input-box input,
.input-box textarea {
  width: 100%;
  padding: 8px;
  font-size: 14px;
}

.input-box.button input {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.input-box.button input:hover {
  background-color: #0056b3;
}

.project-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.project-table th,
.project-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

.project-table th {
  background-color: #f5f5f5;
}

.project-table td button {
  margin-right: 5px;
}
</style>
