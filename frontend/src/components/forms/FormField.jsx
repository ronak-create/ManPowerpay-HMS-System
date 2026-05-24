import Input from '../ui/Input';
import Select from '../ui/Select';
import { Controller } from 'react-hook-form';

// Input field wired to react-hook-form
export function FormInput({ name, control, rules, label, ...rest }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <Input label={label} error={error?.message} {...field} {...rest} />
      )}
    />
  );
}

// Select field wired to react-hook-form
export function FormSelect({ name, control, rules, label, children, ...rest }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <Select label={label} error={error?.message} {...field} {...rest}>
          {children}
        </Select>
      )}
    />
  );
}
