import { getAllPendaftar } from '@/lib/actions/admin'
import { AdminTableClient } from '@/components/admin/AdminTableClient'

interface Props {
  searchParams: { status?: string; prodi?: string; q?: string; page?: string }
  prodiList:   { id: string; nama_prodi: string; nama_singkat: string; kode_prodi: string }[]
}

export async function AdminTableServer({ searchParams, prodiList }: Props) {
  const currentPage = parseInt(searchParams.page ?? '1')

  const { data, count } = await getAllPendaftar({
    status:           searchParams.status as any,
    program_studi_id: searchParams.prodi,
    search:           searchParams.q,
    page:             currentPage,
    limit:            20,
  })

  return (
    <AdminTableClient
      initialData={data}
      initialCount={count}
      searchParams={searchParams}
      prodiList={prodiList}
    />
  )
}
