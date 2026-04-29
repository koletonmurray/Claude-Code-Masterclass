import styles from "./Avatar.module.css"

interface AvatarProps {
  name: string
}

function getInitials(name: string): string {
  const uppers = name.replace(/[^A-Z]/g, "")
  if (uppers.length >= 2) return uppers.slice(0, 2)
  return name.charAt(0).toUpperCase()
}

export default function Avatar({ name }: AvatarProps) {
  return (
    <div className={styles.avatar}>
      {getInitials(name)}
    </div>
  )
}
