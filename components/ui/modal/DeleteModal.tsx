import { View, Text } from 'react-native'
import React from 'react'
import {
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Button,
  ModalFooter,
  Modal,
} from '@gluestack-ui/themed'
type DeleteModalProps = {
  visible: boolean
  onClose: () => void
  handleDelete: () => void
}
export default function DeleteModal(props: DeleteModalProps) {
  const { visible, onClose, handleDelete } = props
  return (
    <Modal isOpen={visible} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          Are you sure you want to delete this item?
          <ModalCloseButton></ModalCloseButton>
        </ModalHeader>

        <ModalFooter>
          <Button onPress={() => onClose()} variant="outline">
            Cancel
          </Button>
          <Button onPress={() => handleDelete()} variant="solid">
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
