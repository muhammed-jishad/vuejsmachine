<template>
  <div>
    <h2>Tasks for Project {{ projectId }}</h2>

    <!-- Filters -->
    <div class="filters">
      <div class="input-box">
        <label>Status:</label>
        <select v-model="filters.status" @change="fetchTasks">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div class="input-box">
        <label>Assign To:</label>
        <select v-model.number="filters.assigned_to" @change="fetchTasks">
          <option value="">All</option>
          <option v-for="user in allUsers" :key="user.id" :value="user.id">
            {{ user.name || user.email || 'User ' + user.id }}
          </option>
        </select>

      </div>

      <div class="input-box">
        <label>Sort by Due Date:</label>
        <select v-model="filters.sort_direction" @change="fetchTasks">
          <option value="">None</option>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>

    <button @click="showTaskModal = true" class="open-modal-btn">+ Add New Task</button>

    <!-- Add New Task Modal -->
    <div v-if="showTaskModal" class="modal-overlay" @click.self="showTaskModal = false">
      <div class="modal-content" style="width: 50%;">
        <h3>Add New Task</h3>
        <form @submit.prevent="createTask">
          <div class="input-box">
            <input v-model="newTask.title" placeholder="Title" required />
          </div>
          <div class="input-box">
            <input v-model="newTask.description" placeholder="Description" />
          </div>
          <div class="input-box">
            <input v-model="newTask.due_date" type="date" />
          </div>
          <div class="input-box">
            <select v-model="newTask.status" required>
              <option>pending</option>
              <option>completed</option>
            </select>
          </div>
          <div class="input-box">
            <label style="color:black">Assign To:</label>
            <select v-model.number="newTask.assigned_to">
              <option value="">Select User</option>
              <option v-for="user in allUsers" :key="user.id" :value="user.id">
                {{ user.name || user.email || 'User ' + user.id }}
              </option>
            </select>

          </div>

          <div class="input-box button">
            <input type="submit" value="Create Task" />
          </div>
          <button type="button" @click="showTaskModal = false" class="close-modal-btn">Cancel</button>
        </form>
      </div>
    </div>

    <!-- Task Table -->
    <table border="1" cellpadding="6" cellspacing="0" class="task-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Updated Date</th>
          <th>Assigned To</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task.id">
          <td>{{ task.title }}</td>
          <td>{{ task.status }}</td>
          <td>{{ task.updated_at }}</td>
          <td>
            <!-- Show assigned user name or fallback to ID -->
            {{ getUserName(task.assigned_to) }}
          </td>
          <td>
            <button @click="deleteTask(task.id)" style="color: red;">Delete</button>
            <button @click="showCommentsModal(task.id)">Comments</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Comments Modal -->
    <div v-if="modalTaskId !== null" class="modal-overlay">
      <div class="modal">
        <h3>Comments for Task ID {{ modalTaskId }}</h3>
        <ul>
          <li v-for="comment in comments[modalTaskId] || []" :key="comment.id">
            {{ comment.content }}
            <button @click="deleteComment(modalTaskId, comment.id)" style="color: red;">x</button>
          </li>
        </ul>
        <form @submit.prevent="addComment(modalTaskId)">
          <div class="input-box">
            <input v-model="newComments[modalTaskId]" placeholder="Add comment" required />
          </div>
          <div class="input-box button">
            <input type="submit" value="Add Comment" />
          </div>
        </form>
        <div class="input-box button">
          <input type="button" value="Close" @click="modalTaskId = null" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: {
    projectId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      tasks: [],
      users: [],              // <-- list of users
      showTaskModal: false,
      comments: {},
      modalTaskId: null,
      newComments: {},
      newTask: {
        title: "",
        description: "",
        due_date: "",
        status: "pending",
        assigned_to: null,
      },
      filters: {
        status: "",
        assigned_to: null,
        sort_direction: "",
      },
    };
  },
  async created() {
    try {
      const res = await axios.get(this.apiBaseUrl+'api/getUsers', this.getAuthHeaders());
      this.allUsers = res.data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  },
  methods: {
    getAuthHeaders() {
      return {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };
    },

    async fetchTasks() {
      try {
        const params = {};

        if (this.filters.status) {
          params.status = this.filters.status;
        }

        if (this.filters.assigned_to) {
          params.assigned_to = this.filters.assigned_to;
        }

        if (this.filters.sort_direction) {
          params.sort_direction = this.filters.sort_direction;
        }


        const config = {
          headers: this.getAuthHeaders().headers,
          params: params,
        };

        const response = await axios.get(
          `${this.apiBaseUrl}api/projects/${this.projectId}/tasks`,
          config
        );
        this.tasks = response.data;

        for (const task of this.tasks) {
          await this.fetchComments(task.id);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    },

    async createTask() {
      try {
        const taskData = Object.assign({}, this.newTask);
        taskData.project_id = this.projectId;


        const response = await axios.post(
          `${this.apiBaseUrl}api/projects/${this.projectId}/tasks`,
          taskData,
          this.getAuthHeaders()
        );

        this.tasks.push(response.data);

        this.newTask = {
          title: "",
          description: "",
          due_date: "",
          status: "pending",
          assigned_to: null,
        };
        this.showTaskModal = false;
      } catch (error) {
        console.error("Error creating task:", error.response?.data || error.message);
      }
    },

    async deleteTask(taskId) {
      if (!confirm("Are you sure you want to delete this task?")) return;
      try {
        await axios.delete(`${this.apiBaseUrl}api/tasks/${taskId}`, this.getAuthHeaders());
        this.tasks = this.tasks.filter((task) => task.id !== taskId);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },

    async fetchComments(taskId) {
      try {
        const response = await axios.get(
          `${this.apiBaseUrl}api/tasks/${taskId}/comments`,
          this.getAuthHeaders()
        );
        this.$set(this.comments, taskId, response.data);
      } catch (error) {
        console.error(`Error fetching comments for task ${taskId}:`, error);
      }
    },

    async addComment(taskId) {
      if (!this.newComments[taskId]) return;
      try {
        const response = await axios.post(
          `${this.apiBaseUrl}api/tasks/${taskId}/comments`,
          { content: this.newComments[taskId] },
          this.getAuthHeaders()
        );
        if (!this.comments[taskId]) this.$set(this.comments, taskId, []);
        this.comments[taskId].push(response.data);
        this.newComments[taskId] = "";
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    },

    async deleteComment(taskId, commentId) {
      try {
        await axios.delete(
          `${this.apiBaseUrl}api/tasks/${taskId}/comments/${commentId}`,
          this.getAuthHeaders()
        );
        this.comments[taskId] = this.comments[taskId].filter((c) => c.id !== commentId);
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    },

    showCommentsModal(taskId) {
      this.modalTaskId = taskId;
    },

    getUserName(userId) {
      const user = this.users.find((u) => u.id === userId);
      if (!user) return userId || "Unassigned";
      return user.name || user.email || `User ${userId}`;
    },
  },
};
</script>

<style scoped>
.input-box {
  margin: 10px 0;
}

.input-box input,
.input-box select {
  width: 100%;
  padding: 5px;
}

.task-table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
}

.task-table th,
.task-table td {
  padding: 8px;
  text-align: left;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  width: 400px;
  border-radius: 8px;
}

.open-modal-btn {
  margin-bottom: 15px;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.close-modal-btn {
  margin-top: 10px;
  background: #ccc;
  padding: 8px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.input-box {
  display: flex;
  flex-direction: column;
  min-width: 180px;
}
</style>
