import { componentSchemas } from "./schemas"
import { componentRegistry } from "./registry"

export function createPuckConfig() {
  const components: any = {}
  
  for (const [name, info] of Object.entries(componentSchemas)) {
    const fields: any = {}
    for (const [propName, propType] of Object.entries(info.schema.props)) {
      if (propType === "string") {
        fields[propName] = { type: "text", label: propName }
      } else if (propType === "number") {
        fields[propName] = { type: "text", label: propName }
      } else if (propType === "boolean") {
        fields[propName] = { type: "text", label: propName }
      } else {
        fields[propName] = { type: "text", label: propName }
      }
    }
    
    components[name] = {
      label: info.schema.description,
      fields,
      defaultProps: info.defaultProps,
      render: (props: any) => {
        const Component = componentRegistry[name as keyof typeof componentRegistry]
        return <Component {...props} />
      }
    }
  }
  
  return { components }
}
