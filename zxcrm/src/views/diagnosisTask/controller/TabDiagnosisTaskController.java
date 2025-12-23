package org.jeecg.modules.demo.diagnosisTask.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.jeecg.common.api.vo.Result;
import org.jeecg.common.system.query.QueryGenerator;
import org.jeecg.common.util.oConvertUtils;
import org.jeecg.modules.demo.diagnosisTask.entity.TabDiagnosisTask;
import org.jeecg.modules.demo.diagnosisTask.service.ITabDiagnosisTaskService;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.extern.slf4j.Slf4j;

import org.jeecgframework.poi.excel.ExcelImportUtil;
import org.jeecgframework.poi.excel.def.NormalExcelConstants;
import org.jeecgframework.poi.excel.entity.ExportParams;
import org.jeecgframework.poi.excel.entity.ImportParams;
import org.jeecgframework.poi.excel.view.JeecgEntityExcelView;
import org.jeecg.common.system.base.controller.JeecgController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import com.alibaba.fastjson.JSON;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.jeecg.common.aspect.annotation.AutoLog;

 /**
 * @Description: 前侧任务表
 * @Author: jeecg-boot
 * @Date:   2025-06-05
 * @Version: V1.0
 */
@Api(tags="前侧任务表")
@RestController
@RequestMapping("/diagnosisTask/tabDiagnosisTask")
@Slf4j
public class TabDiagnosisTaskController extends JeecgController<TabDiagnosisTask, ITabDiagnosisTaskService> {
	@Autowired
	private ITabDiagnosisTaskService tabDiagnosisTaskService;
	
	/**
	 * 分页列表查询
	 *
	 * @param tabDiagnosisTask
	 * @param pageNo
	 * @param pageSize
	 * @param req
	 * @return
	 */
	//@AutoLog(value = "前侧任务表-分页列表查询")
	@ApiOperation(value="前侧任务表-分页列表查询", notes="前侧任务表-分页列表查询")
	@GetMapping(value = "/list")
	public Result<IPage<TabDiagnosisTask>> queryPageList(TabDiagnosisTask tabDiagnosisTask,
								   @RequestParam(name="pageNo", defaultValue="1") Integer pageNo,
								   @RequestParam(name="pageSize", defaultValue="10") Integer pageSize,
								   HttpServletRequest req) {
		QueryWrapper<TabDiagnosisTask> queryWrapper = QueryGenerator.initQueryWrapper(tabDiagnosisTask, req.getParameterMap());
		Page<TabDiagnosisTask> page = new Page<TabDiagnosisTask>(pageNo, pageSize);
		IPage<TabDiagnosisTask> pageList = tabDiagnosisTaskService.page(page, queryWrapper);
		return Result.OK(pageList);
	}
	
	/**
	 *   添加
	 *
	 * @param tabDiagnosisTask
	 * @return
	 */
	@AutoLog(value = "前侧任务表-添加")
	@ApiOperation(value="前侧任务表-添加", notes="前侧任务表-添加")
	//@RequiresPermissions("org.jeecg.modules.demo:tab_diagnosis_task:add")
	@PostMapping(value = "/add")
	public Result<String> add(@RequestBody TabDiagnosisTask tabDiagnosisTask) {
		tabDiagnosisTaskService.save(tabDiagnosisTask);
		return Result.OK("添加成功！");
	}
	
	/**
	 *  编辑
	 *
	 * @param tabDiagnosisTask
	 * @return
	 */
	@AutoLog(value = "前侧任务表-编辑")
	@ApiOperation(value="前侧任务表-编辑", notes="前侧任务表-编辑")
	//@RequiresPermissions("org.jeecg.modules.demo:tab_diagnosis_task:edit")
	@RequestMapping(value = "/edit", method = {RequestMethod.PUT,RequestMethod.POST})
	public Result<String> edit(@RequestBody TabDiagnosisTask tabDiagnosisTask) {
		tabDiagnosisTaskService.updateById(tabDiagnosisTask);
		return Result.OK("编辑成功!");
	}
	
	/**
	 *   通过id删除
	 *
	 * @param id
	 * @return
	 */
	@AutoLog(value = "前侧任务表-通过id删除")
	@ApiOperation(value="前侧任务表-通过id删除", notes="前侧任务表-通过id删除")
	//@RequiresPermissions("org.jeecg.modules.demo:tab_diagnosis_task:delete")
	@DeleteMapping(value = "/delete")
	public Result<String> delete(@RequestParam(name="id",required=true) String id) {
		tabDiagnosisTaskService.removeById(id);
		return Result.OK("删除成功!");
	}
	
	/**
	 *  批量删除
	 *
	 * @param ids
	 * @return
	 */
	@AutoLog(value = "前侧任务表-批量删除")
	@ApiOperation(value="前侧任务表-批量删除", notes="前侧任务表-批量删除")
	//@RequiresPermissions("org.jeecg.modules.demo:tab_diagnosis_task:deleteBatch")
	@DeleteMapping(value = "/deleteBatch")
	public Result<String> deleteBatch(@RequestParam(name="ids",required=true) String ids) {
		this.tabDiagnosisTaskService.removeByIds(Arrays.asList(ids.split(",")));
		return Result.OK("批量删除成功!");
	}
	
	/**
	 * 通过id查询
	 *
	 * @param id
	 * @return
	 */
	//@AutoLog(value = "前侧任务表-通过id查询")
	@ApiOperation(value="前侧任务表-通过id查询", notes="前侧任务表-通过id查询")
	@GetMapping(value = "/queryById")
	public Result<TabDiagnosisTask> queryById(@RequestParam(name="id",required=true) String id) {
		TabDiagnosisTask tabDiagnosisTask = tabDiagnosisTaskService.getById(id);
		if(tabDiagnosisTask==null) {
			return Result.error("未找到对应数据");
		}
		return Result.OK(tabDiagnosisTask);
	}

    /**
    * 导出excel
    *
    * @param request
    * @param tabDiagnosisTask
    */
    //@RequiresPermissions("org.jeecg.modules.demo:tab_diagnosis_task:exportXls")
    @RequestMapping(value = "/exportXls")
    public ModelAndView exportXls(HttpServletRequest request, TabDiagnosisTask tabDiagnosisTask) {
        return super.exportXls(request, tabDiagnosisTask, TabDiagnosisTask.class, "前侧任务表");
    }

    /**
      * 通过excel导入数据
    *
    * @param request
    * @param response
    * @return
    */
    //@RequiresPermissions("tab_diagnosis_task:importExcel")
    @RequestMapping(value = "/importExcel", method = RequestMethod.POST)
    public Result<?> importExcel(HttpServletRequest request, HttpServletResponse response) {
        return super.importExcel(request, response, TabDiagnosisTask.class);
    }

}
