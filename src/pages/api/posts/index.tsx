import { api } from '@/utils/api'
import React from 'react'

const Index = () => {
    const { data } = api.post.findMany.useQuery({})
  return (
    <div>
    </div>
  )
}

export default Index
