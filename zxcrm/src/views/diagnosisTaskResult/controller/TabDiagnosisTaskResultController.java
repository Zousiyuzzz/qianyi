package org.jeecg.modules.demo.diagnosisTaskResult.controller;

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
import org.jeecg.modules.demo.diagnosisTaskResult.entity.TabDiagnosisTaskResult;
import org.jeecg.modules.demo.diagnosisTaskResult.service.ITabDiagnosisTaskResultService;

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
 * @Description: 前侧任务结果表
 * @Author: jeecg-boot
 * @Date:   2025-06-05
 * @Version: V1.0
 */
@Api(tags="前侧任务结果表")
@RestController
@RequestMapping("/diagnosisTaskResult/tabDiagnosisTaskResult")
@Slf4j
public class TabDiagnosisTaskResultController extends JeecgController<TabDiagnosisTaskResult, ITabDiagnosisTaskResultService> {
	@Autowired
	private ITabDiagnosisTaskResultService tabDiagnosisTaskResultService;
	
	/**
	 * 分页列表查询
	 *
	 * @param tabDiagnosisTaskResult
	 * @param pageNo
	 * @param pageSize
	 * @param req
	 * @return
	 */
	//@AutoLog(value = "前侧任务结果表-分页列表查询")
	@ApiOperation(value="前侧任务结果表-分页列表查询", notes="前侧任务结果表-分页列表查询")
	@GetMapping(value = "/list")
	public Result<IPage<TabDiagnosisTaskResult>> queryPageList(TabDiagnosisTaskResult tabDiagnosisTaskResult,
								   @RequestParam(name="pageNo", defaultValue="1") Integer pageNo,
								   @RequestParam(name="pageSize", defaultValue="10") Integer pageSize,
								   HttpServletRequest req) {
		QueryWrapper<TabDiagnosisTaskResult> queryWrapper = QueryGenerator.initQueryWrapper(tabDiagnosisTaskResult, req.getParameterMap());
		Page<TabDiagnosisTaskResult> page = new Page<TabDiagnosisTaskResult>(pageNo, pageSize);
		IPage<TabDiagnosisTaskResult> pageList = tabDiagnosisTaskResultService.page(page, queryWrapper);
		return Result.OK(pageList);
	}
	
	/**
	 *   添加
	 *
	 * @param tabDiagnosisTaskResult
	 * @return
	 */
	@AutoLog(value = "前侧任务结果表-添加")
	@ApiOperation(value="前侧任务结果表-添加", notes="前侧任务结果表-添加")
	//@RequiresPermissions("org.jeecg.modules.demo:tab_diagnosis_task_result:add")
	@PostMapping(value = "/add")
	public Result<String> add(@RequestBody TabDiagnosisTaskResult tabDiagnosisTaskResult) {
		tabDiagnosisTaskResultService.save(tabDiagnosisTaskResult);
		return Result.OK("添加成功！");
	}
	
	/**
	 *  编辑
	 *
	 * @param tabDiagnosisTaskResult
	 * @return
	 */
	@AutoLog(value = "前侧任务结果表-编辑")
	@ApiOperation(value="前侧任务结果表-编辑", notes="前侧任务结果表-编辑")
	//@RequiresPermissions("org.jeecg.modules.demo:tab_diagnosis_task_result:edit")
	@RequestMapping(value = "/edit", method = {RequestMethod.PUT,RequestMethod.POST})
	public Result<String> edit(@RequestBody TabDiagnosisTaskResult tabDiagnosisTaskResult) {
		tabDiagnosisTaskResultService.updateById(tabDiagnosisTaskResult);
		return Result.OK("编辑成功!");
	}
	
	/**
	 *   通过id删除
	 *
	 * @param id
	 * @return
	 */
	@AutoLog(value = "前侧任务结果表-通过id删除")
	@ApiOperation(value="前侧任务结果表-通过id删除", notes="前侧任务结果表-通过id删除")
	//@RequiresPermissions("org.jeecg.modules.demo:tab_diagnosis_task_result:delete")
	@DeleteMapping(value = "/delete")
	public Result<String> delete(@RequestParam(name="id",required=true) String id) {
		tabDiagnosisTaskResultService.removeById(id);
		return Result.OK("删除成功!");
	}
	
	/**
	 *  批量删除
	 *
	 * @param ids
	 * @return
	 */
	@AutoLog(value = "前侧任务结果表-批量删除")
	@ApiOperation(value="前侧任务结果表-批量删除", notes="前侧任务结果表-批量删除")
	//@RequiresPermissions("org.jeecg.modules.demo:tab_diagnosis_task_result:deleteBatch")
	@DeleteMapping(value = "/deleteBatch")
	public Result<String> deleteBatch(@RequestParam(name="ids",required=true) String ids) {
		this.tabDiagnosisTaskResultService.removeByIds(Arrays.asList(ids.split(",")));
		return Result.OK("批量删除成功!");
	}
	
	/**
	 * 通过id查询
	 *
	 * @param id
	 * @return
	 */
	//@AutoLog(value = "前侧任务结果表-通过id查询")
	@ApiOperation(value="前侧任务结果表-通过id查询", notes="前侧任务结果表-通过id查询")
	@GetMapping(value = "/queryById")
	public Result<TabDiagnosisTaskResult> queryById(@RequestParam(name="id",required=true) String id) {
		TabDiagnosisTaskResult tabDiagnosisTaskResult = tabDiagnosisTaskResultService.getById(id);
		if(tabDiagnosisTaskResult==null) {
			return Result.error("未找到对应数据");
		}
		return Result.OK(tabDiagnosisTaskResult);
	}

    /**
    * 导出excel
    *
    * @param request
    * @param tabDiagnosisTaskResult
    */
    //@RequiresPermissions("org.jeecg.modules.demo:tab_diagnosis_task_result:exportXls")
    @RequestMapping(value = "/exportXls")
    public ModelAndView exportXls(HttpServletRequest request, TabDiagnosisTaskResult tabDiagnosisTaskResult) {
        return super.exportXls(request, tabDiagnosisTaskResult, TabDiagnosisTaskResult.class, "前侧任务结果表");
    }

    /**
      * 通过excel导入数据
    *
    * @param request
    * @param response
    * @return
    */
    //@RequiresPermissions("tab_diagnosis_task_result:importExcel")
    @RequestMapping(value = "/importExcel", method = RequestMethod.POST)
    public Result<?> importExcel(HttpServletRequest request, HttpServletResponse response) {
        return super.importExcel(request, response, TabDiagnosisTaskResult.class);
    }

}
