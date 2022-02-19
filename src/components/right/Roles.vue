<template>
    <div>
    <!-- 导航面包屑 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片 -->
  <el-card class="box-card">
  <!-- 添加角色按钮 -->
  <el-button class="gapbottom" type="primary" @click="dialogVisible = true">添加角色</el-button>
  <!-- 角色列表 -->
    <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
            <template slot-scope="scope" width="80%">
              {{scope.row}}
                <el-row :class="['bdbottom','vcenter',i1 === 0 ?'bdtop':'']" v-for="(child, i1) in scope.row.children" :key="child.id">
                    <el-col class="ccenter" :span="6">
                        <el-tag closable @close="deleteRole(scope.row, child.id)">
                        {{child.authName}}
                        </el-tag>
                        <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                        <el-row  :class="['vcenter',i2 === 0 ?'':'bdtop']" v-for="(secchild,i2) in child.children" :key="secchild.id">
                            <el-col class="ccenter"  :span="5">
                                <el-tag type="success" closable @close="deleteRole(scope.row, secchild.id)">
                                {{secchild.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="19">
                                <el-tag type="warning" v-for="thirdchild in secchild.children" :key="thirdchild.id" closable
                                @close="deleteRole(scope.row, thirdchild.id)">
                                {{thirdchild.authName}}
                                </el-tag>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </template>
        </el-table-column>
        <el-table-column type="index">
        </el-table-column>
        <el-table-column prop="roleName" label="角色名称">
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述">
        </el-table-column>
        <el-table-column label="操作" width="290px">
        <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="getRoleInfo(scope.row.id)" >编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRoleInfo(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="allotRoleInfo(scope.row)">分配权限</el-button>
        </template>
        </el-table-column>
    </el-table>
  </el-card>
  <!--添加角色用的对话框-->
    <el-dialog
    title="添加角色"
    :visible.sync="dialogVisible"
    width="50%"
    :before-close="handleClose">
    <el-form :model="roleInfo" :rules="addRoleRules" ref="addRoleRef" label-width="100px" class="demo-ruleForm">
    <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="roleInfo.roleName" clearable=""></el-input>
    </el-form-item>
    <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="roleInfo.roleDesc" clearable=""></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="addRoles()">确 定</el-button>
    </span>
    </el-dialog>

    <!--编辑用户信息用的对话框-->
    <el-dialog
    title="编辑角色信息"
    :visible.sync="dialog2Visible"
    width="50%"
    :before-close="handleClose2">
    <el-form :model="editedRoleInfo" :rules="addRoleRules" ref="editRoleRef" label-width="100px" class="demo-ruleForm">
    <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="editedRoleInfo.roleName" clearable=""></el-input>
    </el-form-item>
    <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="editedRoleInfo.roleDesc" clearable=""></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose2">取 消</el-button>
        <el-button type="primary" @click="editRole(editedRoleInfo.roleId)">确 定</el-button>
    </span>
    </el-dialog>

    <!--分配用户权限用的对话框-->
    <el-dialog
    title="分配权限信息"
    :visible.sync="dialog3Visible"
    width="50%"
    @close="handleClose3">
    <!-- 树形区域，分配权限 -->
    <el-tree :props="treeProps"  :data="rightsList" show-checkbox
    node-key="id"  :default-checked-keys="checkedList"
    default-expand-all ref="rightsTreeRef">
    </el-tree>
    <span slot="footer" class="dialog-footer">
        <el-button @click="dialog3Visible=false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created () {
    this.getRolesList()
    this.getRightList()
  },
  data () {
    return {
      rolesList: [],
      dialogVisible: false,
      dialog2Visible: false,
      dialog3Visible: false,
      roleInfo: {
        roleName: '',
        roleDesc: ''
      },
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      editedRoleInfo: {},
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      rightsList: [],
      checkedList: [],
      allotRightRoleId: ''
    }
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rolesList = res.data
    },
    async deleteRole (role, rulesid) {
      this.$confirm('此操作将永久删除该角色权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('roles/' + role.id + '/rights/' + rulesid).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error(res.data.meta.msg)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          role.children = res.data.data
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    async addRoles () {
      this.$refs.addRoleRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('请按照要求格式输入')
          this.dialogVisible = true
          return
        }
        const { data: res } = await this.$http.post('roles', this.roleInfo)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.dialogVisible = false
        this.getRolesList()
      })
    },
    handleClose (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.$refs.addRoleRef.resetFields()
          this.dialogVisible = false
          done()
        })
        .catch(_ => {})
    },
    handleClose2 (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.$refs.editRoleRef.resetFields()
          this.dialog2Visible = false
          done()
        })
        .catch(_ => {})
    },
    handleClose3 (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
        //  this.$refs.editRoleRef.resetFields()
          this.dialog3Visible = false
          this.allotRightRoleId = ''
          this.checkedList = []
          this.$nextTick(function () { this.$refs.rightsTreeRef.setCheckedKeys(this.checkedList) })
          done()
        })
        .catch(_ => {})
    },
    async getRoleInfo (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editedRoleInfo = res.data
      this.dialog2Visible = true
    },
    async getRightList () {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightsList = res.data
    },
    async editRole (id) {
      this.$refs.editRoleRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('请按照要求格式输入')
          this.dialog2Visible = true
          return
        }
        const { data: res } = await this.$http.put('roles/' + id, this.editedRoleInfo)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.dialog2Visible = false
        this.getRolesList()
      })
    },
    async deleteRoleInfo (uid) {
      this.$confirm('此操作将永久删除该条角色信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('roles/' + uid).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error(res.data.meta.msg)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getRolesList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 树形结构区域
    allotRoleInfo (data) {
      this.getCheckList(data.children, this.checkedList)
      this.allotRightRoleId = data.id
      this.$nextTick(function () { this.$refs.rightsTreeRef.setCheckedKeys(this.checkedList) })
      this.dialog3Visible = true
    },
    async allotRight () {
      const ridlist = [
        ...this.$refs.rightsTreeRef.getHalfCheckedKeys(),
        ...this.$refs.rightsTreeRef.getCheckedKeys()
      ]
      const { data: res } = await this.$http.post('roles/' + this.allotRightRoleId + '/rights', { rids: ridlist.join(',') })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.allotRightRoleId = ''
      this.dialog3Visible = false
      this.getRolesList()
    },
    getCheckList (data, arr) {
      for (const child of data) {
        if (child.children) {
          this.getCheckList(child.children, arr)
        } else {
          // checkedList只收入第三级节点
          arr.push(child.id)
        }
      }
    }
  }
}

</script>

<style lang="less" scoped>
.bdbottom {
    border-bottom: 1px solid #eee;
}
.bdtop {
    border-top: 1px solid #eee;
}
.vcenter {
    display: flex;
    align-items: center;
    align-content: center;
}
.gapbottom {
    margin-bottom: 15px;
}
.ccenter {
    text-align: center;
}
</style>
