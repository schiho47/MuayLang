import React from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionContent,
} from './index'

import { MUAY_PURPLE } from '@/constants/Colors'
import { ChevronDownIcon, ChevronUpIcon } from '@gluestack-ui/themed'

type FormAccordionProps = {
  title: string
  children: React.ReactNode
  leftIcon?: React.ReactNode
  defaultExpanded?: boolean
}

const FormAccordion = (props: FormAccordionProps) => {
  const { title, children, defaultExpanded = false } = props

  return (
    <Accordion
      variant="unfilled"
      type="single"
      className="w-full"
      defaultValue={defaultExpanded ? ['item-1'] : []}
    >
      <AccordionItem value="item-1">
        <AccordionHeader>
          <AccordionTrigger>
            {({ isExpanded }: { isExpanded: boolean }) => {
              return (
                <>
                  <AccordionTitleText style={{ color: MUAY_PURPLE }}>{title}</AccordionTitleText>
                  {isExpanded ? (
                    <ChevronUpIcon color={MUAY_PURPLE} size="md" />
                  ) : (
                    <ChevronDownIcon color={MUAY_PURPLE} size="md" />
                  )}
                </>
              )
            }}
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default FormAccordion
