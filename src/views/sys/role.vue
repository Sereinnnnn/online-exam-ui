<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('table.roleName')" v-model="listQuery.roleName" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button v-if="role_btn_add" class="filter-item" style="margin-left: 10px;" icon="el-icon-check" plain @click="handleCreate">{{ $t('table.add') }}</el-button>
      <el-button v-if="role_btn_del" class="filter-item" icon="el-icon-delete" plain @click="handleDeletes">{{ $t('table.del') }}</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      :default-sort="{ prop: 'id', order: 'descending' }"
      border
      highlight-current-row
      style="width: 100%;"
      @cell-dblclick="handleUpdate"
      @selection-change="handleSelectionChange"
      @sort-change="sortChange">
      <el-table-column type="selection" width="55"/>
      <el-table-column :label="$t('table.roleCode')" sortable prop="role_code" min-width="90" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.roleCode }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.roleName')" sortable prop="role_name" min-width="90" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.roleName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.roleDesc')" min-width="90" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.roleDesc }}</span>
        </template>
      </el-table-column>
<!--      <el-table-column :label="$t('table.ownDept')" min-width="90" align="center">-->
<!--        <template slot-scope="scope">-->
<!--          <span>{{ scope.row.deptName }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column :label="$t('table.isDefault')" align="center" width="120px">-->
<!--        <template slot-scope="scope">-->
<!--          {{ scope.row.isDefault | isDefaultFilter }}-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column :label="$t('table.status')" align="center" width="120px">-->
<!--        <template slot-scope="scope">-->
<!--          <el-tag :type="scope.row.status | statusTypeFilter">{{ scope.row.status | statusFilter }}</el-tag>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column :label="$t('table.actions')" class-name="status-col" width="300px">
        <template slot-scope="scope">
          <el-button v-if="role_btn_edit" type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button v-if="role_btn_del" size="mini" type="danger" @click="handleDelete(scope.row)">{{ $t('table.delete') }}
          </el-button>
          <el-button v-if="role_btn_auth" size="mini" @click="handlePermission(scope.row)">{{ $t('table.permission') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.pageNum" :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="60%" top="10vh">
      <el-form ref="dataForm" :rules="rules" :model="temp" :label-position="labelPosition" label-width="100px">
        <el-form-item :label="$t('table.roleCode')" prop="roleCode">
          <el-input v-model="temp.roleCode" :readonly="temp.readonly"/>
        </el-form-item>
        <el-form-item :label="$t('table.roleName')" prop="roleName">
          <el-input v-model="temp.roleName"/>
        </el-form-item>
        <el-form-item :label="$t('table.roleDesc')" prop="roleDesc">
          <el-input v-model="temp.roleDesc"/>
        </el-form-item>
<!--        <el-form-item :label="$t('table.isDefault')">-->
<!--          <el-radio-group v-model="temp.isDefault">-->
<!--            <el-radio :label="1">是</el-radio>-->
<!--            <el-radio :label="0">否</el-radio>-->
<!--          </el-radio-group>-->
<!--        </el-form-item>-->
<!--        <el-form-item :label="$t('table.status')">-->
<!--          <el-radio-group v-model="temp.status">-->
<!--            <el-radio :label="0">启用</el-radio>-->
<!--            <el-radio :label="1">禁用</el-radio>-->
<!--          </el-radio-group>-->
<!--        </el-form-item>-->
<!--        <el-form-item :label="$t('table.ownDept')" prop="deptName">-->
<!--          <el-input v-model="temp.deptName" @focus="handleSelectDept"/>-->
<!--          <el-input v-model="temp.deptId" type="hidden"/>-->
<!--        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogDeptVisible">
      <el-tree
        :data="treeDeptData"
        :props="defaultProps"
        class="filter-tree"
        node-key="id"
        default-expand-all
        highlight-current
        @node-click="getNodeData"
      />
    </el-dialog>

    <el-dialog :visible.sync="dialogPermissionVisible" title="角色权限" top="10vh">
      <el-tree
        ref="menuTree"
        :data="treePermissionData"
        :props="permissionProps"
        :default-checked-keys="checkedKeys"
        show-checkbox
        class="filter-tree"
        node-key="id"
        default-expand-all
        highlight-current
        check-strictly
        @node-click="getNodeData"
      />
      <div slot="footer" class="dialog-footer">
        <el-button v-if="role_btn_edit" type="primary" @click="savePermission(id, roleCode)">保存</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, addObj, putObj, delObj, fetchDeptTree, fetchRoleTree, permissionUpdate, delAllObj } from '@/api/admin/role'
import { fetchTree } from '@/api/admin/menu'
import waves from '@/directive/waves'
import { mapGetters } from 'vuex'
import { checkMultipleSelect, notifySuccess, messageSuccess } from '@/utils/util'

export default {
  name: 'RoleManagement',
  directives: {
    waves
  },
  filters: {
    statusTypeFilter(status) {
      const statusMap = {
        0: 'success',
        1: 'danger'
      }
      return statusMap[status]
    },
    statusFilter(status) {
      return status === '0' ? '启用' : '禁用'
    },
    isDefaultFilter(status) {
      return status === '1' ? '是' : '否'
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        roleName: undefined,
        sort: 'create_date',
        order: 'descending'
      },
      temp: {
        id: '',
        roleName: '',
        roleCode: '',
        roleDesc: '',
        status: 0,
        deptId: '',
        deptName: '',
        isDefault: '0'
      },
      treeData: [],
      treeDeptData: [],
      treePermissionData: [],
      checkedKeys: [],
      multipleSelection: [],
      dialogFormVisible: false,
      dialogDeptVisible: false,
      dialogPermissionVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新建'
      },
      pvData: [],
      rules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'change' }],
        roleCode: [{ required: true, message: '请输入角色代码', trigger: 'change' }]
      },
      downloadLoading: false,
      defaultProps: {
        children: 'children',
        label: 'deptName'
      },
      permissionProps: {
        children: 'children',
        lable: 'name'
      },
      labelPosition: 'right',
      role_btn_add: false,
      role_btn_edit: false,
      role_btn_del: false,
      role_btn_auth: false
    }
  },
  created() {
    this.getList()
    this.role_btn_add = this.permissions['sys:role:add']
    this.role_btn_edit = this.permissions['sys:role:edit']
    this.role_btn_del = this.permissions['sys:role:del']
    this.role_btn_auth = this.permissions['sys:role:auth']
  },
  computed: {
    ...mapGetters([
      'elements',
      'permissions'
    ])
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 500)
      })
    },
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    handleModifyStatus(row, status) {
      row.status = status
      putObj(row).then(() => {
        this.dialogFormVisible = false
        messageSuccess(this, '操作成功')
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    sortChange(column, prop, order) {
      this.listQuery.sort = column.prop
      this.listQuery.order = column.order
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: '',
        roleName: '',
        roleCode: '',
        roleDesc: '',
        status: 0,
        deptId: '',
        deptName: '',
        isDefault: '0'
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addObj(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.getList()
            notifySuccess(this, '创建成功')
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.born = new Date(parseInt(this.temp.born))
      this.temp.sex = parseInt(this.temp.sex)
      this.temp.status = parseInt(this.temp.status)
      this.temp.isDefault = parseInt(this.temp.isDefault)
      this.temp.readonly = true
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          putObj(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.getList()
            notifySuccess(this, '更新成功')
          })
        }
      })
    },
    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delObj(row.id).then(() => {
          this.dialogFormVisible = false
          this.getList()
          notifySuccess(this, '删除成功')
        })
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
      }).catch(() => {})
    },
    // 批量删除
    handleDeletes() {
      if (checkMultipleSelect(this.multipleSelection, this )) {
        let ids = ''
        for (let i = 0; i < this.multipleSelection.length; i++) {
          ids += this.multipleSelection[i].id + ','
        }
        this.$confirm('确定要删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delAllObj({ idString: ids }).then(() => {
            this.dialogFormVisible = false
            this.getList()
            notifySuccess(this, '删除成功')
          })
        }).catch(() => {})
      }
    },
    // 所属部门
    handleSelectDept() {
      fetchDeptTree().then(response => {
        this.treeDeptData = response.data
        this.dialogDeptVisible = true
      })
    },
    getNodeData(data) {
      this.dialogDeptVisible = false
      this.temp.deptId = data.id
      this.temp.deptName = data.deptName
    },
    // 分配权限
    handlePermission(row) {
      fetchRoleTree(row.roleCode)
        .then(response => {
          this.checkedKeys = response.data
          return fetchTree()
        })
        .then(response => {
          this.treePermissionData = response.data
          this.dialogPermissionVisible = true
          this.id = row.id
          this.roleCode = row.roleCode
        })
    },
    // 保存权限
    savePermission(id, roleCode) {
      const keys = this.$refs.menuTree.getCheckedKeys()
      let menus = ''
      if (keys.length > 0) {
        for (let i = 0; i < keys.length; i++) {
          menus = menus + keys[i] + ','
        }
      }
      // 更新
      permissionUpdate(id, menus).then(() => {
        this.dialogPermissionVisible = false
        // 重新加载
        fetchTree()
          .then(response => {
            this.treePermissionData = response.data
            return fetchRoleTree(roleCode)
          })
          .then(response => {
            this.checkedKeys = response.data
            notifySuccess(this, '修改成功')
          })
      })
    }
  }
}
</script>
