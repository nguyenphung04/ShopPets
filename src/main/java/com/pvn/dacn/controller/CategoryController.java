package com.pvn.dacn.controller;

import com.pvn.dacn.dto.CategoryCreateDTO;
import com.pvn.dacn.dto.CategoryUpdateDTO;
import com.pvn.dacn.entity.Category;
import com.pvn.dacn.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public List<Category> getAll() {
        return categoryService.getCategories();
    }

    @PostMapping
    Category createCategory(@RequestBody CategoryCreateDTO request){
        return categoryService.createRequest(request);
    }

    @PutMapping("/{id}")
    Category updateCategory(@PathVariable String id, CategoryUpdateDTO request){
        return categoryService.updateRequest(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        categoryService.delCategory(id);
        return ResponseEntity.ok(Map.of("message", "Xóa thành công"));
    }
}