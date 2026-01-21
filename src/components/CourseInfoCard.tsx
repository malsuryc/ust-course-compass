"use client";

import type { CourseNodeMetadata } from "@/types/graph";

interface CourseInfoCardProps {
  meta: CourseNodeMetadata;
  courseCode: string;
  courseName: string;
  onClose: () => void;
}

/**
 * Info Card Component for Master Node
 * Displays detailed course metadata in an expandable panel
 */
export function CourseInfoCard({
  meta,
  courseCode,
  courseName,
  onClose,
}: CourseInfoCardProps) {
  const {
    coursePrefix,
    courseNumber,
    academicCareer,
    schoolCode,
    courseDescription,
    courseVector,
    courseVectorPrinted,
    coursePrerequisite,
    courseCorequisite,
    courseExclusion,
    courseBackground,
    courseColisted,
    courseCrossCampusEquivalence,
    courseReference,
    previousCourseCodes,
    alternativeCourseCodes,
    courseAttributes,
  } = meta;

  return (
    <div
      className="nowheel"
      style={{
        position: "absolute",
        left: "calc(100% + 12px)",
        top: 0,
        width: 320,
        maxHeight: 400,
        background: "var(--c-bg-card)",
        border: "1px solid var(--c-border-active)",
        padding: "var(--space-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-sm)",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid var(--c-border)",
          paddingBottom: "var(--space-sm)",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "var(--c-text-main)",
            }}
          >
            {courseCode}
          </div>
          <div
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.75rem",
              color: "var(--c-text-sub)",
              marginTop: 2,
            }}
          >
            {courseName}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--c-text-sub)",
            fontSize: "1rem",
            lineHeight: 1,
            padding: 4,
          }}
          title="Close info card"
        >
          ✕
        </button>
      </div>

      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-sm)",
        }}
      >
        {/* Basic Info */}
        <InfoSection title="Basic Info">
          <InfoRow label="Prefix" value={coursePrefix} />
          <InfoRow label="Number" value={courseNumber} />
          <InfoRow label="Career" value={academicCareer} />
          <InfoRow label="School" value={schoolCode} />
          <InfoRow label="Vector" value={courseVectorPrinted || courseVector} />
        </InfoSection>

        {/* Description */}
        {courseDescription && (
          <InfoSection title="Description">
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.75rem",
                color: "var(--c-text-sub)",
                lineHeight: 1.5,
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {courseDescription}
            </p>
          </InfoSection>
        )}

        {/* Requirements */}
        {(coursePrerequisite || courseCorequisite || courseExclusion) && (
          <InfoSection title="Requirements">
            {coursePrerequisite && (
              <InfoRow label="Prerequisite" value={coursePrerequisite} multiline />
            )}
            {courseCorequisite && (
              <InfoRow label="Corequisite" value={courseCorequisite} multiline />
            )}
            {courseExclusion && (
              <InfoRow label="Exclusion" value={courseExclusion} multiline />
            )}
          </InfoSection>
        )}

        {/* Background */}
        {courseBackground && (
          <InfoSection title="Recommended Background">
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.75rem",
                color: "var(--c-text-sub)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {courseBackground}
            </p>
          </InfoSection>
        )}

        {/* Related Courses */}
        {(courseColisted ||
          courseCrossCampusEquivalence ||
          previousCourseCodes.length > 0 ||
          alternativeCourseCodes.length > 0) && (
          <InfoSection title="Related Courses">
            {courseColisted && <InfoRow label="Co-listed" value={courseColisted} />}
            {courseCrossCampusEquivalence && (
              <InfoRow label="Cross-Campus" value={courseCrossCampusEquivalence} />
            )}
            {previousCourseCodes.length > 0 && (
              <InfoRow label="Previous Codes" value={previousCourseCodes.join(", ")} />
            )}
            {alternativeCourseCodes.length > 0 && (
              <InfoRow label="Alternative Codes" value={alternativeCourseCodes.join(", ")} />
            )}
          </InfoSection>
        )}

        {/* Reference */}
        {courseReference && (
          <InfoSection title="Reference">
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.75rem",
                color: "var(--c-text-sub)",
                lineHeight: 1.5,
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {courseReference}
            </p>
          </InfoSection>
        )}

        {/* Course Attributes */}
        {courseAttributes.length > 0 && (
          <InfoSection title="Attributes">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {courseAttributes.map((attr, idx) => (
                <div
                  key={idx}
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.6875rem",
                    color: "var(--c-text-sub)",
                    padding: "4px 6px",
                    background: "var(--c-bg-outer)",
                    border: "1px solid var(--c-border)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--c-text-main)",
                    }}
                  >
                    {attr.courseAttribute}:{attr.courseAttributeValue}
                  </span>{" "}
                  — {attr.courseAttributeValueDescription}
                </div>
              ))}
            </div>
          </InfoSection>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: "var(--c-text-main)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  if (!value) return null;

  return (
    <div
      style={{
        display: multiline ? "block" : "flex",
        gap: 8,
        marginBottom: multiline ? 6 : 2,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.6875rem",
          color: "var(--c-text-sub)",
          minWidth: multiline ? undefined : 70,
          flexShrink: 0,
        }}
      >
        {label}:
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6875rem",
          color: "var(--c-text-main)",
          wordBreak: "break-word",
          whiteSpace: multiline ? "pre-wrap" : "normal",
          marginTop: multiline ? 2 : 0,
          display: multiline ? "block" : "inline",
        }}
      >
        {value}
      </span>
    </div>
  );
}
