<template>
<div>
  <div class="spiner">
  <a-input-search
      placeholder="Введите данные для поиска"
      style="width: 300px"
      @search="onSearch"
    /></div>
  <Table
    :data-source='datasource'
    :columns='columns'
    v-if="!loading" 
  >
    <template #contacts="{ text }">
      <p><UserOutlined /> {{ text.name }}</p>
      <p><PhoneOutlined /> {{ text.phone }}</p>
      <p><MailOutlined /> {{ text.email }}</p>
    </template>
  </Table>
<div class="spiner"><Spin :indicator="indicator" v-if="loading" size="large"/></div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {Spin, Table, Input} from 'ant-design-vue';
import {UserOutlined, PhoneOutlined, MailOutlined} from '@ant-design/icons-vue';

export default defineComponent({
  name: 'App',
  components: {
    Table,
    Spin,
    'a-input-search': Input.Search,
    UserOutlined,
    PhoneOutlined,
    MailOutlined
  },
  data () {
  return {
    datasource: [],
    columns: [
        {
          title: 'Название',
          dataIndex: 'title',
          key: 'title',
        },
        {
          title: 'Бюджет',
          dataIndex: 'budget',
          key: 'budget',
        },
        {
          title: 'Контакты',
          dataIndex: 'contacts',
          key: 'contacts',
          slots: { customRender: 'contacts' }
        },
        {
          title: 'Статус',
          dataIndex: 'status',
          key: 'status',
        },
        {
          title: 'Ответственный',
          key: 'responsible',
          dataIndex: 'responsible',
        },
         {
          title: 'Дата создания',
          key: 'date',
          dataIndex: 'date',
        }, 
      ],
    loading: true,
    url: 'http://localhost:5000/api/leads'
  }
},
 methods: {
        onSearch(searchValue: string) {
            this.loading = true;
            fetch (`${this.url}?query=${searchValue}`)
            .then(response => response.json())
            .then(response => {
              this.datasource = response.length ? response : [];
              this.loading = false
            })
            .catch(() => alert('ОШИБКА ЗАГРУЗКИ ДАННЫХ'))
          },
        getLeads() {
         fetch (`${this.url}`)
        .then(response => response.json())
        .then(response => {
              this.datasource = response.length ? response : [];
              this.loading = false
            })
        .catch(() => alert('ОШИБКА ЗАГРУЗКИ ДАННЫХ'))
        } 
    },
     mounted() {
        this.getLeads();
    },
});
</script>

<style>
.spiner {
  text-align: center;
  margin: 30px 0;
}
</style>
