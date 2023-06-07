import { useSession } from 'next-auth/react'
import React from 'react'

const Edit = () => {
  const { data: sessionData} = useSession();

  if (!sessionData?.user) {
    return (
      <div>
        <h1>Sign in to edit your profile</h1>
      </div>
    )
  }

  return (
    <div>
    </div>
  )
}

export default Edit
