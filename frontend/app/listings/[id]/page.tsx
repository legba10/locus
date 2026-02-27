import { redirect } from 'next/navigation'

interface Props {
  params: { id?: string }
}

/** TZ-75: canonical route is /listing/[id]. Redirect old /listings/[id] to it. */
export default function ListingsIdRedirect({ params }: Props) {
  const id = params?.id != null ? String(params.id).trim() : ''
  if (!id) redirect('/listings')
  redirect(`/listing/${id}`)
}
