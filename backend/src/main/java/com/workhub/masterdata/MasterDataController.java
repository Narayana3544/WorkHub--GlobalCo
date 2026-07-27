package com.workhub.masterdata;

import com.workhub.masterdata.dto.CreateMasterDataRequest;
import com.workhub.masterdata.dto.MasterDataResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/masterdata")
public class MasterDataController {

    private final MasterDataService masterDataService;

    public MasterDataController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    /**
     * Public endpoint: get all active master data grouped by category.
     */
    @GetMapping("/public")
    public ResponseEntity<Map<String, List<MasterDataResponse>>> getAllActiveGrouped() {
        return ResponseEntity.ok(masterDataService.getAllActiveGrouped());
    }

    /**
     * Admin: get all master data including inactive.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MasterDataResponse>> getAll() {
        return ResponseEntity.ok(masterDataService.getAll());
    }

    /**
     * Admin: create new master data entry.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MasterDataResponse> create(@Valid @RequestBody CreateMasterDataRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(masterDataService.create(request));
    }

    /**
     * Admin: update master data entry (label + display order only).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MasterDataResponse> update(@PathVariable Long id,
                                                      @Valid @RequestBody CreateMasterDataRequest request) {
        return ResponseEntity.ok(masterDataService.update(id, request));
    }

    /**
     * Admin: soft-delete master data entry (sets active=false).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        masterDataService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
