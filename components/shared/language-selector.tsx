/**
 * Компонент для выбора языка перевода
 * Использует Command + Popover для поиска по языкам
 */

'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Language, getPopularLanguages, getAllLanguages } from '@/constants/languages'
import { TEXTS } from '@/constants/texts'
import { cn } from '@/lib/utils'

interface LanguageSelectorProps {
  /** Выбранный язык */
  selectedLanguage: Language
  /** Callback при выборе языка */
  onLanguageChange: (language: Language) => void
  /** Disabled состояние */
  disabled?: boolean
}

export function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false)

  const popularLanguages = getPopularLanguages()
  const allLanguages = getAllLanguages()

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {TEXTS.tools.imageTranslator.selectLanguage}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 opacity-50" />
              <span>
                {selectedLanguage.nativeName} ({selectedLanguage.name})
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={TEXTS.tools.imageTranslator.languagePlaceholder}
            />
            <CommandList>
              <CommandEmpty>Язык не найден</CommandEmpty>

              {/* Популярные языки */}
              <CommandGroup heading={TEXTS.tools.imageTranslator.popularLanguages}>
                {popularLanguages.map((language) => (
                  <CommandItem
                    key={language.code}
                    value={`${language.name} ${language.nativeName} ${language.code}`}
                    onSelect={() => {
                      onLanguageChange(language)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedLanguage.code === language.code
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{language.nativeName}</span>
                      <span className="text-xs text-muted-foreground">
                        {language.name}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>

              {/* Все языки */}
              <CommandGroup heading={TEXTS.tools.imageTranslator.allLanguages}>
                {allLanguages
                  .filter(lang => !lang.popular)
                  .map((language) => (
                    <CommandItem
                      key={language.code}
                      value={`${language.name} ${language.nativeName} ${language.code}`}
                      onSelect={() => {
                        onLanguageChange(language)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedLanguage.code === language.code
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{language.nativeName}</span>
                        <span className="text-xs text-muted-foreground">
                          {language.name}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
