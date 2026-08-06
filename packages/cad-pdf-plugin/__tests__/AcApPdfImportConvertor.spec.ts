const pdfjsMock = {
  GlobalWorkerOptions: { workerSrc: '' },
  OPS: {
    moveTo: 1,
    lineTo: 2,
    stroke: 3
  },
  getDocument: jest.fn()
}

const logMock = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
}

jest.mock('pdfjs-dist', () => pdfjsMock)

jest.mock('@mlightcad/data-model', () => {
  class AcDbLine {
    constructor(
      public startPoint: unknown,
      public endPoint: unknown
    ) {}
  }

  class AcDbPolyline {
    vertices: unknown[] = []
    closed = false

    addVertexAt(index: number, point: unknown) {
      this.vertices[index] = point
    }
  }

  class AcGePoint2d {
    constructor(
      public x: number,
      public y: number
    ) {}
  }

  class AcGePoint3d {
    constructor(
      public x: number,
      public y: number,
      public z: number
    ) {}
  }

  return {
    AcDbLine,
    AcDbPolyline,
    AcGePoint2d,
    AcGePoint3d,
    log: logMock
  }
})

import { AcApPdfImportConvertor } from '../src/AcApPdfImportConvertor'

const createContext = () => ({
  doc: {
    database: {
      tables: {
        blockTable: {
          modelSpace: {
            appendEntity: jest.fn()
          }
        }
      }
    }
  }
})

const createPdfPage = (operatorList = {
  fnArray: [pdfjsMock.OPS.moveTo, pdfjsMock.OPS.lineTo, pdfjsMock.OPS.stroke],
  argsArray: [[0, 0], [72, 72], []]
}) => ({
  getViewport: jest.fn(() => ({ height: 72 })),
  getOperatorList: jest.fn(async () => operatorList),
  getAnnotations: jest.fn()
})

describe('AcApPdfImportConvertor with PDF.js 6', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('configures the PDF.js ESM worker', () => {
    expect(pdfjsMock.GlobalWorkerOptions.workerSrc).toContain('pdf.worker.mjs')
  })

  it('opens a valid PDF input and imports extracted line geometry', async () => {
    const page = createPdfPage()
    pdfjsMock.getDocument.mockReturnValue({
      promise: Promise.resolve({ getPage: jest.fn(async () => page) })
    })
    const context = createContext()
    const data = new TextEncoder().encode('%PDF-1.7 valid vector page').buffer

    await new AcApPdfImportConvertor().convert(context as never, data)

    expect(pdfjsMock.getDocument).toHaveBeenCalledWith({ data })
    expect(page.getOperatorList).toHaveBeenCalledTimes(1)
    expect(context.doc.database.tables.blockTable.modelSpace.appendEntity)
      .toHaveBeenCalledTimes(1)
    expect(logMock.error).not.toHaveBeenCalled()
  })

  it('does not expose embedded PDF actions to an annotation execution surface', async () => {
    const page = createPdfPage()
    pdfjsMock.getDocument.mockReturnValue({
      promise: Promise.resolve({ getPage: jest.fn(async () => page) })
    })

    await new AcApPdfImportConvertor().convert(
      createContext() as never,
      new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer
    )

    expect(page.getAnnotations).not.toHaveBeenCalled()
  })

  it('keeps invalid PDF failures contained in the importer', async () => {
    pdfjsMock.getDocument.mockReturnValue({
      promise: Promise.reject(new Error('invalid PDF'))
    })

    await expect(
      new AcApPdfImportConvertor().convert(
        createContext() as never,
        new Uint8Array([0, 1, 2]).buffer
      )
    ).resolves.toBeUndefined()

    expect(logMock.error).toHaveBeenCalledWith(
      '[PdfImport] Failed to import PDF:',
      expect.any(Error)
    )
  })
})
