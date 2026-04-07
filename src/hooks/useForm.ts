import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

type FieldKey<T> = Extract<keyof T, string>

type FieldValidator<T, K extends keyof T> = (value: T[K], values: T) => string | null

type ValidationSchema<T> = Partial<{
  [K in keyof T]: FieldValidator<T, K> | Array<FieldValidator<T, K>>
}>

type FormErrors<T> = Partial<Record<FieldKey<T>, string>>

interface UseFormResult<T> {
  values: T
  errors: FormErrors<T>
  handleChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (event: FormEvent) => Promise<void>
  isSubmitting: boolean
  setFieldValue: <K extends FieldKey<T>>(field: K, value: T[K]) => void
}

function runValidation<T>(values: T, validationSchema: ValidationSchema<T>): FormErrors<T> {
  const nextErrors: FormErrors<T> = {}

  for (const rawKey of Object.keys(validationSchema) as Array<FieldKey<T>>) {
    const validators = validationSchema[rawKey as keyof T]
    if (!validators) {
      continue
    }

    const validatorsList = Array.isArray(validators) ? validators : [validators]
    for (const validator of validatorsList) {
      const message = validator(values[rawKey as keyof T], values)
      if (message) {
        nextErrors[rawKey] = message
        break
      }
    }
  }

  return nextErrors
}

export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validationSchema: ValidationSchema<T> = {},
): UseFormResult<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors<T>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setFieldValue = <K extends FieldKey<T>>(field: K, value: T[K]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) {
        return current
      }

      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name } = event.target

    let nextValue: unknown
    if (event.target instanceof HTMLInputElement) {
      if (event.target.type === 'checkbox') {
        nextValue = event.target.checked
      } else if (event.target.type === 'number') {
        nextValue = event.target.value === '' ? '' : event.target.valueAsNumber
      } else {
        nextValue = event.target.value
      }
    } else {
      nextValue = event.target.value
    }

    setFieldValue(name as FieldKey<T>, nextValue as T[FieldKey<T>])
  }

  const handleSubmit =
    (onSubmit: (nextValues: T) => void | Promise<void>) => async (event: FormEvent) => {
      event.preventDefault()

      const nextErrors = runValidation(values, validationSchema)
      setErrors(nextErrors)

      if (Object.keys(nextErrors).length > 0) {
        return
      }

      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setIsSubmitting(false)
      }
    }

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
    isSubmitting,
    setFieldValue,
  }
}
