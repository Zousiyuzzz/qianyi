<template>
  <div class="page-header-index-wide page-header-wrapper-grid-content-main">

    <a-card :bordered="false">
      <div class="account-center-avatarHolder">
        <div class="avatar">
          <img :src="getAvatar()" />
        </div>
        <div class="username">{{ nickname() }}</div>
        <div class="bio">{{ username() }}</div>
      </div>
      <div class="account-center-detail">
        <p>
          <i class="title"></i>账号：{{ username() }}
        </p>
        <p>
          <i class="group"></i>用户姓名：{{ nickname() }}
        </p>
        <!-- <p>
          <i class="address"></i>安全模式：{{ sysSafeMode() ? '已开启' : '未开启' }}
        </p> -->
      </div>
      <a-divider />

      <div class="account-center-tags">
        <div class="tagsTitle">权限信息</div>
        <div class="permission-list">
          <a-collapse>
            <a-collapse-panel header="菜单权限" key="1">
              <div class="menu-permission">
                <a-tree :treeData="menuTreeData" :defaultExpandAll="false" :showLine="true">
                  <template slot="title" slot-scope="{ title }">
                    <span>{{ title }}</span>
                  </template>
                </a-tree>
              </div>
            </a-collapse-panel>
            <a-collapse-panel header="功能权限" key="2">
              <div class="permission-tags">
                <a-tag v-for="(item, index) in permissionList" :key="index" color="blue">
                  {{ item }}
                </a-tag>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </div>

      <a-divider />

      <div class="account-center-actions">
        <!-- <a-button type="primary" @click="handleEditProfile">
          <a-icon type="edit" />编辑资料
        </a-button> -->
        <a-button type="primary" style="margin-left: 8px" @click="handleChangePassword">
          <a-icon type="lock" />修改密码
        </a-button>
      </div>
    </a-card>
    <user-password ref="userPassword"></user-password>
    <user-modal ref="modalForm" @ok="modalFormOk"></user-modal>
  </div>
</template>

<script>
import PageLayout from '@/components/page/PageLayout'
import RouteView from "@/components/layouts/RouteView"
import { AppPage, ArticlePage, ProjectPage } from './page'
import { mapGetters, mapState } from 'vuex'
import { getFileAccessHttpUrl } from '@/api/manage';
import UserPassword from '@/components/tools/UserPassword'
import UserModal from '@/views/system/modules/UserModal'

export default {
  components: {
    RouteView,
    PageLayout,
    AppPage,
    ArticlePage,
    ProjectPage,
    UserPassword,
    UserModal
  },
  data() {
    return {
      tags: ['很有想法的', '专注设计', '辣~', '大长腿', '川妹子', '海纳百川'],

      tagInputVisible: false,
      tagInputValue: '',
      noTitleKey: 'app',
      menuTreeData: []
    }
  },
  computed: {
    ...mapState({
      permissionMenuList: state => state.user.permissionList
    })
  },
  mounted() {
    this.initMenuTree()
  },
  methods: {
    ...mapGetters(["nickname", "avatar", "username", "permissionList", "sysSafeMode", "userInfo"]),
    getAvatar() {
      return getFileAccessHttpUrl(this.avatar());
    },
    handleTabChange(key, type) {
      this[type] = key
    },

    handleTagClose(removeTag) {
      const tags = this.tags.filter(tag => tag != removeTag)
      this.tags = tags
    },

    showTagInput() {
      this.tagInputVisible = true
      this.$nextTick(() => {
        this.$refs.tagInput.focus()
      })
    },

    handleInputChange(e) {
      this.tagInputValue = e.target.value
    },

    handleTagInputConfirm() {
      const inputValue = this.tagInputValue
      let tags = this.tags
      if (inputValue && tags.indexOf(inputValue) === -1) {
        tags = [...tags, inputValue]
      }

      Object.assign(this, {
        tags,
        tagInputVisible: false,
        tagInputValue: ''
      })
    },
    handleEditProfile() {
      this.$refs.modalForm.edit(this.userInfo());
    },
    handleChangePassword() {
      let username = this.userInfo().username
      this.$refs.userPassword.show(username)
    },
    modalFormOk() {
      this.$message.success('资料更新成功');
    },
    initMenuTree() {
      this.menuTreeData = this.convertToTreeData(this.permissionMenuList)
    },
    convertToTreeData(menus) {
      if (!menus || !Array.isArray(menus)) {
        return []
      }
      return menus.map(menu => {
        if (!menu.meta || !menu.meta.title) {
          return null
        }

        const node = {
          title: menu.meta.title,
          key: menu.path || menu.id,
          icon: menu.meta && menu.meta.icon
        }

        if (menu.children && menu.children.length > 0) {
          const children = this.convertToTreeData(menu.children)
          if (children.length > 0) {
            node.children = children
          }
        }

        return node
      }).filter(Boolean)
    }
  },
}
</script>

<style lang="less" scoped>
.page-header-wrapper-grid-content-main {
  width: 100%;
  height: 100%;
  min-height: 100%;
  transition: .3s;

  .account-center-avatarHolder {
    text-align: center;
    margin-bottom: 24px;

    &>.avatar {
      margin: 0 auto;
      width: 104px;
      height: 104px;
      margin-bottom: 20px;
      border-radius: 50%;
      overflow: hidden;

      img {
        height: 100%;
        width: 100%;
      }
    }

    .username {
      color: rgba(0, 0, 0, 0.85);
      font-size: 20px;
      line-height: 28px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .bio {
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
    }
  }

  .account-center-detail {
    p {
      margin-bottom: 8px;
      padding-left: 26px;
      position: relative;
    }

    i {
      position: absolute;
      height: 14px;
      width: 14px;
      left: 0;
      top: 4px;
      background: url(https://gw.alipayobjects.com/zos/rmsportal/pBjWzVAHnOOtAUvZmZfy.svg)
    }

    .title {
      background-position: 0 0;
    }

    .group {
      background-position: 0 -22px;
    }

    .address {
      background-position: 0 -44px;
    }
  }

  .account-center-tags {
    .tagsTitle {
      font-weight: 500;
      color: rgba(0, 0, 0, .85);
      margin-bottom: 12px;
    }

    .permission-list {
      margin-top: 8px;

      .menu-permission {
        padding: 8px;
        background: #fafafa;
        border-radius: 4px;
      }

      .permission-tags {
        .ant-tag {
          margin-bottom: 8px;
        }
      }
    }
  }

  .account-center-actions {
    text-align: center;
    margin-top: 24px;
  }
}
</style>