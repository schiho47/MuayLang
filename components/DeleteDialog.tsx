import React from 'react'
import { Dialog, Portal, Button } from 'react-native-paper'

type DeleteDialogProps = {
  visible: boolean
  hideDialog: () => void
  handleDelete: () => void
}

const DeleteDialog = (props: DeleteDialogProps) => {
  const { visible, hideDialog, handleDelete } = props

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Icon icon="alert" />
        <Dialog.Title className="text-muay-purple">
          Are you sure you want to delete this item?
        </Dialog.Title>
        <Dialog.Actions>
          <Button onPress={() => hideDialog()}>Cancel</Button>
          <Button onPress={() => handleDelete()}>Confirm</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

export default DeleteDialog
