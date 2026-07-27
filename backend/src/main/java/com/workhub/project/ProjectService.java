package com.workhub.project;

import com.workhub.project.dto.CreateProjectRequest;
import com.workhub.project.dto.ProjectResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Transactional
    public ProjectResponse create(CreateProjectRequest request, String orgId) {
        if (projectRepository.existsByProjectKeyAndOrgId(request.getProjectKey(), orgId)) {
            throw new IllegalArgumentException("Project key '" + request.getProjectKey() + "' already exists in your organization");
        }

        Project project = new Project();
        project.setName(request.getName());
        project.setProjectKey(request.getProjectKey());
        project.setDescription(request.getDescription());
        project.setOrgId(orgId);

        return toResponse(projectRepository.save(project));
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> listByOrg(String orgId) {
        return projectRepository.findByOrgId(orgId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getById(String id, String orgId) {
        Project project = projectRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        return toResponse(project);
    }

    @Transactional
    public ProjectResponse update(String id, CreateProjectRequest request, String orgId) {
        Project project = projectRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        // project key is immutable after creation

        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public void delete(String id, String orgId) {
        Project project = projectRepository.findByIdAndOrgId(id, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        projectRepository.delete(project);
    }

    private ProjectResponse toResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .projectKey(project.getProjectKey())
                .description(project.getDescription())
                .orgId(project.getOrgId())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
