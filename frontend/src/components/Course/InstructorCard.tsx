type Props = {
  name: string
  avatarUrl: string
  bio: string
}

export default function InstructorCard({ name, avatarUrl, bio }: Props) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 shadow-soft">
      <h3 className="text-white font-semibold mb-3">Instructor</h3>
      <div className="flex items-center gap-3">
        <img src={avatarUrl} alt={name} className="h-14 w-14 rounded-full border border-slate-700" />
        <div>
          <div className="text-white font-medium">{name}</div>
          <p className="text-slate-300 text-sm leading-snug max-w-prose">{bio}</p>
        </div>
      </div>
    </div>
  )
}
