import { useEffect } from 'react';
import { TaskType } from '../../types/enums';

interface TaskTypeSelectorProps {
  value: TaskType;
  onChange: (type: TaskType) => void;
  userRole: string;
  disabled?: boolean;
}

const TaskTypeSelector = ({
  value,
  onChange,
  userRole,
  disabled = false,
}: TaskTypeSelectorProps) => {
  // Default to SELF_WORK for employees, ASSIGNED for others
  useEffect(() => {
    if (!value) {
      onChange(userRole === 'EMPLOYEE' ? TaskType.SELF_WORK : TaskType.ASSIGNED);
    }
  }, [userRole, value, onChange]);

  const isEmployee = userRole === 'EMPLOYEE';

  return (
    <div style={{ marginBottom: '20px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 500,
          color: '#374151',
          marginBottom: '8px',
        }}
      >
        Task Type
      </label>
      <div
        style={{
          display: 'flex',
          gap: '16px',
        }}
      >
        {/* ASSIGNED Radio Button */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: isEmployee || disabled ? 'not-allowed' : 'pointer',
            opacity: isEmployee || disabled ? 0.5 : 1,
            padding: '12px 16px',
            border: `2px solid ${
              value === TaskType.ASSIGNED ? '#3b82f6' : '#e5e7eb'
            }`,
            borderRadius: '10px',
            background: value === TaskType.ASSIGNED ? '#eff6ff' : '#ffffff',
            transition: 'all 0.2s ease',
            flex: 1,
          }}
        >
          <input
            type="radio"
            name="taskType"
            value={TaskType.ASSIGNED}
            checked={value === TaskType.ASSIGNED}
            onChange={() => onChange(TaskType.ASSIGNED)}
            disabled={isEmployee || disabled}
            style={{
              width: '18px',
              height: '18px',
              cursor: isEmployee || disabled ? 'not-allowed' : 'pointer',
              accentColor: '#3b82f6',
            }}
          />
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1f2937',
                marginBottom: '2px',
              }}
            >
              Assigned Task
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#6b7280',
              }}
            >
              Created by Team Lead/Admin
            </div>
          </div>
        </label>

        {/* SELF_WORK Radio Button */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            padding: '12px 16px',
            border: `2px solid ${
              value === TaskType.SELF_WORK ? '#3b82f6' : '#e5e7eb'
            }`,
            borderRadius: '10px',
            background: value === TaskType.SELF_WORK ? '#eff6ff' : '#ffffff',
            transition: 'all 0.2s ease',
            flex: 1,
          }}
        >
          <input
            type="radio"
            name="taskType"
            value={TaskType.SELF_WORK}
            checked={value === TaskType.SELF_WORK}
            onChange={() => onChange(TaskType.SELF_WORK)}
            disabled={disabled}
            style={{
              width: '18px',
              height: '18px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              accentColor: '#3b82f6',
            }}
          />
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1f2937',
                marginBottom: '2px',
              }}
            >
              Self-Work Proposal
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#6b7280',
              }}
            >
              Requires approval to start
            </div>
          </div>
        </label>
      </div>
      {isEmployee && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#6b7280',
            fontStyle: 'italic',
          }}
        >
          Note: Employees can only create self-work proposals
        </div>
      )}
    </div>
  );
};

export default TaskTypeSelector;
